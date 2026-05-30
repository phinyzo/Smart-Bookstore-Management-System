const Book = require('../models/Book');

// @desc    Get all books with search & filter
// @route   GET /api/books
// @access  Public
exports.getAllBooks = async (req, res, next) => {
  try {
    const { search, genre, author, page = 1, limit = 10 } = req.query;

    // Build dynamic query
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (genre)  query.genre = { $regex: genre, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);

    const books = await Book.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.status(200).json({
      books,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error in getAllBooks controller:', error.message);
    next(error);
  }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error('Error in getBookById controller:', error.message);
    next(error);
  }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Private/Admin
exports.createBook = async (req, res, next) => {
  try {
    const { title, author, genre, price, stock, isbn, description, imageUrl } = req.body;

    // Check if ISBN already exists
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ message: 'Book with this ISBN already exists' });
    }

    const book = await Book.create({
      title, author, genre, price,
      stock, isbn, description, imageUrl,
    });

    res.status(201).json(book);
  } catch (error) {
    console.error('Error in createBook controller:', error.message);
    next(error);
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private/Admin
exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedBook);
  } catch (error) {
    console.error('Error in updateBook controller:', error.message);
    next(error);
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private/Admin
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error in deleteBook controller:', error.message);
    next(error);
  }
};