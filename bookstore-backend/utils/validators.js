// Fixed: was [^s@] — missing backslash on \s
exports.isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

exports.isStrongPassword = (password) =>
  password.length >= 8;

exports.isValidObjectId = (id) =>
  /^[a-fA-F0-9]{24}$/.test(id);

// Kenyan phone number validation (+254 or 07xx or 01xx)
exports.isValidKenyanPhone = (phone) =>
  /^(\+?254|0)[17]\d{8}$/.test(phone);

// Positive integer amount (KES)
exports.isValidAmount = (amount) =>
  Number.isInteger(amount) && amount > 0;
