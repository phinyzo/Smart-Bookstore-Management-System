import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../api/axiosInstance"
import { toast } from "react-toastify"

// ── Async Actions ──────────────────────────────────────────────

export const fetchLicenseStatus = createAsyncThunk(
  "license/fetchStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/api/license/status")
      return res.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch license status"
      )
    }
  }
)

export const fetchPricing = createAsyncThunk(
  "license/fetchPricing",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/api/license/pricing")
      return res.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch pricing"
      )
    }
  }
)

// ── Initial State ──────────────────────────────────────────────

const initialState = {
  status:    null,   // license status object from backend
  pricing:   null,   // pricing plans
  isLoading: false,
  error:     null,
}

// ── Slice ──────────────────────────────────────────────────────

const licenseSlice = createSlice({
  name: "license",
  initialState,
  reducers: {
    clearLicenseError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLicenseStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLicenseStatus.fulfilled, (state, action) => {
        state.isLoading = false
        state.status = action.payload
      })
      .addCase(fetchLicenseStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      .addCase(fetchPricing.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchPricing.fulfilled, (state, action) => {
        state.isLoading = false
        state.pricing = action.payload
      })
      .addCase(fetchPricing.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        toast.error(action.payload)
      })
  },
})

export const { clearLicenseError } = licenseSlice.actions
export default licenseSlice.reducer
