const express   = require('express');
const router    = express.Router();
const {
  getLicenseStatus,
  getPricing,
  validateKey,
  getAllLicenses,
  adminActivateLicense,
} = require('../controllers/licenseController');
const protect   = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

// Public
router.get('/pricing', getPricing);

// Protected
router.get('/status',        protect, getLicenseStatus);
router.post('/validate',     protect, validateKey);

// Admin only
router.get('/admin/all',                    protect, adminOnly, getAllLicenses);
router.put('/admin/:userId/activate',       protect, adminOnly, adminActivateLicense);

module.exports = router;
