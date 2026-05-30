
const EmailLog = require('../models/EmailLog');

// @desc    Log an email record to MongoDB
// @access  Internal (called by emailService, not exposed as a route)
exports.logEmail = async (userId, emailType, recipientEmail, status = 'Sent') => {
  try {
    const log = await EmailLog.create({
      userId,
      emailType,
      recipientEmail,
      status,
      sentAt: new Date(),
    });
    console.log(`Email logged: [${emailType}] → ${recipientEmail} | Status: ${status}`);
    return log;
  } catch (error) {
    console.error('Error in logEmail controller:', error.message);
  }
};

// @desc    Get all email logs (admin)
// @route   GET /api/emails
// @access  Private/Admin
exports.getAllEmailLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const logs = await EmailLog.find(query)
      .populate('userId', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ sentAt: -1 });

    const total = await EmailLog.countDocuments(query);

    res.status(200).json({
      logs, total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error in getAllEmailLogs controller:', error.message);
    next(error);
  }
};

// @desc    Get email logs for a specific user
// @route   GET /api/emails/user/:userId
// @access  Private/Admin
exports.getEmailLogsByUser = async (req, res, next) => {
  try {
    const logs = await EmailLog.find({ userId: req.params.userId })
      .sort({ sentAt: -1 });

    res.status(200).json(logs);
  } catch (error) {
    console.error('Error in getEmailLogsByUser controller:', error.message);
    next(error);
  }
};
