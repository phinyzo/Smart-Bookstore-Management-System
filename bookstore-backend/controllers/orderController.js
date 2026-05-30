const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Book = require('../models/Book');
const { sendOrderConfirmation } = require('../services/emailService');
const { sendOrderStatusUpdate } = require("../services/emailService")

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    let totalPrice = 0;
    for (const item of items) {
      const book = await Book.findById(item.bookId);
      if (!book) {
        return res.status(404).json({ message: `Book not found: ${item.bookId}` });
      }
      if (book.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${book.title}". Available: ${book.stock}`,
        });
      }
      totalPrice += book.price * item.quantity;
    }

    const order = await Order.create({
      userId: req.user._id,
      totalPrice,
      shippingAddress,
      orderStatus: 'Created',
      paymentStatus: 'Pending',
    });

    for (const item of items) {
      const book = await Book.findById(item.bookId);
      await OrderItem.create({
        orderId: order._id,
        bookId: item.bookId,
        quantity: item.quantity,
        price: book.price,
      });
      await Book.findByIdAndUpdate(item.bookId, {
        $inc: { stock: -item.quantity },
      });
    }

    sendOrderConfirmation(req.user.email, order, req.user._id).catch((err) =>
      console.error('Email sending failed:', err.message)
    );

    const orderItems = await OrderItem.find({ orderId: order._id })
      .populate('bookId', 'title price');

    res.status(201).json({ order, orderItems });
  } catch (error) {
    console.error('Error in createOrder controller:', error.message);
    next(error);
  }
};

// @desc    Get logged-in user orders
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ orderId: order._id })
          .populate('bookId', 'title imageUrl price');
        return { ...order.toObject(), items };
      })
    );

    res.status(200).json(ordersWithItems);
  } catch (error) {
    console.error('Error in getMyOrders controller:', error.message);
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (
      order.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    const items = await OrderItem.find({ orderId: order._id })
      .populate('bookId', 'title price imageUrl');

    res.status(200).json({ order, items });
  } catch (error) {
    console.error('Error in getOrderById controller:', error.message);
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.orderStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.status(200).json({
      orders, total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error in getAllOrders controller:', error.message);
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    // ── Validate orderStatus ──────────────────────────────
    const validOrderStatuses = [
      'Created', 'Confirmed', 'Processing',
      'Shipped', 'Delivered', 'Cancelled'
    ];
    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validOrderStatuses.join(', ')}`
      });
    }

    // ── Validate paymentStatus ────────────────────────────
    const validPaymentStatuses = ['Pending', 'Paid', 'Failed'];
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        message: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`
      });
    }

    // ── Find order ────────────────────────────────────────
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email");

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // ── Update orderStatus ────────────────────────────────
    if (orderStatus) order.orderStatus = orderStatus;

    // ── Update paymentStatus ──────────────────────────────
    if (paymentStatus) {
      // Admin manually provided paymentStatus → use directly
      order.paymentStatus = paymentStatus;
    } else if (orderStatus) {
      // Auto-update based on orderStatus
      if (orderStatus === 'Delivered') {
        order.paymentStatus = 'Paid';    // ← Paid ONLY on Delivered
      } else if (orderStatus === 'Cancelled') {
        order.paymentStatus = 'Failed';  // ← Failed on Cancelled
      }
      // Created / Confirmed / Processing / Shipped → stays Pending
    }

    await order.save();

    // ── Send status update email ──────────────────────────
    if (orderStatus && order.userId?.email) {
      await sendOrderStatusUpdate(
        order.userId.email,
        orderStatus,
        order._id,
        order.userId._id
      )
    }

    res.status(200).json({ message: 'Order updated successfully', order });
  } catch (error) {
    console.error('Error in updateOrderStatus controller:', error.message);
    next(error);
  }
};
