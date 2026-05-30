import axiosInstance from "./axiosInstance"

// ── License API calls ──────────────────────────────────────────

// Get current user's license status
export const fetchLicenseStatus = ()           => axiosInstance.get("/api/license/status")

// Get pricing plans
export const fetchPricing       = ()           => axiosInstance.get("/api/license/pricing")

// Validate a license key
export const validateLicenseKey = (licenseKey) => axiosInstance.post("/api/license/validate", { licenseKey })

// Admin: get all licenses
export const fetchAllLicenses   = (params)     => axiosInstance.get("/api/license/admin/all", { params })

// Admin: manually activate a license
export const adminActivateLicense = (userId, licenseType) =>
  axiosInstance.put(`/api/license/admin/${userId}/activate`, { licenseType })
