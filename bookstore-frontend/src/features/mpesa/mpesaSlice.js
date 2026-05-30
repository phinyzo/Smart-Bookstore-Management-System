import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../api/axiosInstance"
import { toast } from "react-toastify"

// ── Async Actions ──────────────────────────────────────────────

// Initiate STK Push for an order
export const payOrderMpesa = createAsyncThunk(
  "mpesa/payOrder",
  async ({ orderId, phoneNumber }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/api/mpesa/pay-order", { orderId, phoneNumber })
      return res.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "M-Pesa payment failed"
      )
    }
  }
)

// Initiate STK Push for a license
export const payLicenseMpesa = createAsyncThunk(
  "mpesa/payLicense",
  async ({ licenseType, phoneNumber }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/api/mpesa/pay-license", { licenseType, phoneNumber })
      return res.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "License payment failed"
      )
    }
  }
)

// Check transaction status
export const checkMpesaStatus = createAsyncThunk(
  "mpesa/checkStatus",
  async (reference, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/api/mpesa/status/${reference}`)
      return res.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Status check failed"
      )
    }
  }
)

// Fetch payment history
export const fetchMpesaHistory = createAsyncThunk(
  "mpesa/fetchHistory",
  async (params, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/api/mpesa/history", { params })
      return res.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch history"
      )
    }
  }
)

// ── Initial State ──────────────────────────────────────────────

const initialState = {
  // STK Push state
  transactionReference: null,
  stkPushSent:          false,
  stkAmount:            null,

  // Status polling
  paymentStatus: null,  // 'PENDING' | 'SUCCESS' | 'FAILED'
  mpesaReceipt:  null,

  // History
  transactions: [],
  total:        0,
  page:         1,
  pages:        1,

  isLoading:  false,
  isPolling:  false,
  error:      null,
}

// ── Slice ──────────────────────────────────────────────────────

const mpesaSlice = createSlice({
  name: "mpesa",
  initialState,
  reducers: {
    clearMpesaState: (state) => {
      state.transactionReference = null
      state.stkPushSent          = false
      state.stkAmount            = null
      state.paymentStatus        = null
      state.mpesaReceipt         = null
      state.error                = null
    },
    clearMpesaError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Pay order
      .addCase(payOrderMpesa.pending, (state) => {
        state.isLoading = true
        state.error     = null
        state.stkPushSent = false
      })
      .addCase(payOrderMpesa.fulfilled, (state, action) => {
        state.isLoading           = false
        state.stkPushSent         = true
        state.transactionReference = action.payload.transactionReference
        state.stkAmount           = action.payload.amount
        toast.success("📱 STK Push sent! Check your phone and enter your M-Pesa PIN.")
      })
      .addCase(payOrderMpesa.rejected, (state, action) => {
        state.isLoading = false
        state.error     = action.payload
        toast.error(action.payload)
      })

      // Pay license
      .addCase(payLicenseMpesa.pending, (state) => {
        state.isLoading   = true
        state.error       = null
        state.stkPushSent = false
      })
      .addCase(payLicenseMpesa.fulfilled, (state, action) => {
        state.isLoading            = false
        state.stkPushSent          = true
        state.transactionReference = action.payload.transactionReference
        state.stkAmount            = action.payload.amount
        toast.success("📱 STK Push sent! Check your phone and enter your M-Pesa PIN.")
      })
      .addCase(payLicenseMpesa.rejected, (state, action) => {
        state.isLoading = false
        state.error     = action.payload
        toast.error(action.payload)
      })

      // Check status
      .addCase(checkMpesaStatus.pending, (state) => {
        state.isPolling = true
      })
      .addCase(checkMpesaStatus.fulfilled, (state, action) => {
        state.isPolling    = false
        state.paymentStatus = action.payload.status
        state.mpesaReceipt  = action.payload.mpesaReceiptNumber
      })
      .addCase(checkMpesaStatus.rejected, (state, action) => {
        state.isPolling = false
        state.error     = action.payload
      })

      // Fetch history
      .addCase(fetchMpesaHistory.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchMpesaHistory.fulfilled, (state, action) => {
        state.isLoading   = false
        state.transactions = action.payload.transactions
        state.total        = action.payload.total
        state.page         = action.payload.page
        state.pages        = action.payload.pages
      })
      .addCase(fetchMpesaHistory.rejected, (state, action) => {
        state.isLoading = false
        state.error     = action.payload
        toast.error(action.payload)
      })
  },
})

export const { clearMpesaState, clearMpesaError } = mpesaSlice.actions
export default mpesaSlice.reducer
