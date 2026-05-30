import axiosInstance from "./axiosInstance"

// ── M-Pesa / Lipia Online API calls ───────────────────────────

// Initiate STK Push for an order
export const payOrderMpesa   = (data)      => axiosInstance.post("/api/mpesa/pay-order", data)

// Initiate STK Push for a license purchase
export const payLicenseMpesa = (data)      => axiosInstance.post("/api/mpesa/pay-license", data)

// Check transaction status
export const checkMpesaStatus = (reference) => axiosInstance.get(`/api/mpesa/status/${reference}`)

// Get payment history for current user
export const fetchMpesaHistory = (params)  => axiosInstance.get("/api/mpesa/history", { params })

// Admin: get all transactions
export const fetchAllMpesaTransactions = (params) =>
  axiosInstance.get("/api/mpesa/admin/transactions", { params })
