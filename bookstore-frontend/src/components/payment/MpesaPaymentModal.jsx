/**
 * MpesaPaymentModal
 * Handles M-Pesa STK Push flow:
 *   1. User enters phone number
 *   2. STK Push is sent to their phone
 *   3. App polls for payment status
 *   4. Success / failure feedback
 */

import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { payOrderMpesa, payLicenseMpesa, checkMpesaStatus, clearMpesaState } from "../../features/mpesa/mpesaSlice"
import { fetchLicenseStatus } from "../../features/license/licenseSlice"
import { formatKES } from "../../utils/formatPrice"
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, CircularProgress,
  Stepper, Step, StepLabel, Chip, Divider, Alert,
  InputAdornment, LinearProgress
} from "@mui/material"
import {
  PhoneAndroid, CheckCircle, Cancel, HourglassTop,
  Smartphone, Lock, Refresh
} from "@mui/icons-material"

const POLL_INTERVAL_MS = 5000
const MAX_POLLS        = 24  // 2 minutes

const MpesaPaymentModal = ({
  open,
  onClose,
  onSuccess,
  // For order payments:
  orderId,
  amount,
  // For license payments:
  licenseType,
  // Mode: 'order' | 'license'
  mode = "order",
}) => {
  const dispatch = useDispatch()
  const { transactionReference, stkPushSent, paymentStatus, mpesaReceipt, isLoading, isPolling } =
    useSelector((state) => state.mpesa)

  const [phone, setPhone]         = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [pollCount, setPollCount]  = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const pollTimer = useRef(null)

  const steps = ["Enter Phone", "Confirm on Phone", "Payment Complete"]

  // ── Validate Kenyan phone ─────────────────────────────────
  const validatePhone = (val) => {
    const cleaned = val.replace(/\s+/g, "")
    if (!cleaned) return "Phone number is required"
    if (!/^(\+?254|0)[17]\d{8}$/.test(cleaned))
      return "Enter a valid Safaricom number (07xx, 01xx, +254xx)"
    return ""
  }

  // ── Start polling once STK Push is sent ──────────────────
  useEffect(() => {
    if (stkPushSent && transactionReference && activeStep === 1) {
      pollTimer.current = setInterval(async () => {
        setPollCount((c) => {
          if (c >= MAX_POLLS) {
            clearInterval(pollTimer.current)
            return c
          }
          return c + 1
        })
        dispatch(checkMpesaStatus(transactionReference))
      }, POLL_INTERVAL_MS)
    }
    return () => clearInterval(pollTimer.current)
  }, [stkPushSent, transactionReference, activeStep])

  // ── React to payment status changes ──────────────────────
  useEffect(() => {
    if (paymentStatus === "SUCCESS") {
      clearInterval(pollTimer.current)
      setActiveStep(2)
      if (mode === "license") dispatch(fetchLicenseStatus())
    }
    if (paymentStatus === "FAILED") {
      clearInterval(pollTimer.current)
    }
  }, [paymentStatus])

  // ── Advance stepper when STK Push sent ───────────────────
  useEffect(() => {
    if (stkPushSent) setActiveStep(1)
  }, [stkPushSent])

  // ── Reset on close ────────────────────────────────────────
  const handleClose = () => {
    clearInterval(pollTimer.current)
    dispatch(clearMpesaState())
    setPhone("")
    setPhoneError("")
    setActiveStep(0)
    setPollCount(0)
    onClose()
  }

  // ── Handle success confirmation ───────────────────────────
  const handleDone = () => {
    handleClose()
    if (onSuccess) onSuccess({ mpesaReceipt, transactionReference })
  }

  // ── Submit STK Push ───────────────────────────────────────
  const handleSubmit = () => {
    const err = validatePhone(phone)
    if (err) { setPhoneError(err); return }
    setPhoneError("")

    if (mode === "order") {
      dispatch(payOrderMpesa({ orderId, phoneNumber: phone }))
    } else {
      dispatch(payLicenseMpesa({ licenseType, phoneNumber: phone }))
    }
  }

  const pollProgress = Math.min((pollCount / MAX_POLLS) * 100, 100)
  const isTimedOut   = pollCount >= MAX_POLLS && paymentStatus === "PENDING"

  const licenseLabels = {
    one_time: "Lifetime License",
    monthly:  "Monthly Subscription",
    annual:   "Annual Subscription",
  }

  return (
    <Dialog
      open={open}
      onClose={activeStep < 2 ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {/* ── Header ── */}
      <DialogTitle sx={{ bgcolor: "#1a1a2e", color: "#fff", pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Smartphone sx={{ color: "#4CAF50" }} />
          <Box>
            <Typography variant="h6" fontWeight="700">
              Pay with M-Pesa
            </Typography>
            <Typography variant="caption" sx={{ color: "#9FE1CB" }}>
              Powered by Lipia Online · PhinTech Solutions
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>

        {/* ── Stepper ── */}
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label, i) => (
            <Step key={label} completed={activeStep > i}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* ── Amount summary ── */}
        <Box sx={{
          bgcolor: "#f5f5f5", borderRadius: 2,
          px: 2.5, py: 2, mb: 3,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              {mode === "order" ? "ORDER TOTAL" : "LICENSE PAYMENT"}
            </Typography>
            <Typography variant="h5" fontWeight="800" color="#1D9E75">
              {formatKES(amount || 0)}
            </Typography>
          </Box>
          <Chip
            label={mode === "order" ? "Order Payment" : licenseLabels[licenseType] || licenseType}
            color="success"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* ── STEP 0: Phone input ── */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Enter your Safaricom M-Pesa number. You'll receive a payment prompt on your phone.
            </Typography>
            <TextField
              label="M-Pesa Phone Number"
              fullWidth
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                if (phoneError) setPhoneError(validatePhone(e.target.value))
              }}
              error={!!phoneError}
              helperText={phoneError || "Format: 0712345678 or +254712345678"}
              placeholder="0712 345 678"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneAndroid color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="caption">
                🔒 Your payment is processed securely via M-Pesa STK Push.
                We never store your PIN.
              </Typography>
            </Alert>
          </Box>
        )}

        {/* ── STEP 1: Waiting for PIN ── */}
        {activeStep === 1 && (
          <Box sx={{ textAlign: "center", py: 2 }}>
            {paymentStatus !== "FAILED" && !isTimedOut ? (
              <>
                <Box sx={{
                  width: 80, height: 80, borderRadius: "50%",
                  bgcolor: "#E8F5E9", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  mx: "auto", mb: 2,
                }}>
                  <HourglassTop sx={{ fontSize: 40, color: "#1D9E75" }} />
                </Box>
                <Typography variant="h6" fontWeight="700" mb={1}>
                  Check Your Phone
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  A payment request of <strong>{formatKES(amount || 0)}</strong> has been
                  sent to <strong>{phone}</strong>.
                  <br />Enter your M-Pesa PIN to complete the payment.
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Waiting for confirmation...
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Math.max(0, MAX_POLLS - pollCount) * (POLL_INTERVAL_MS / 1000)}s remaining
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={pollProgress}
                    sx={{ borderRadius: 1, height: 6 }}
                    color="success"
                  />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                  <CircularProgress size={16} color="success" />
                  <Typography variant="caption" color="text.secondary">
                    Checking payment status...
                  </Typography>
                </Box>
              </>
            ) : paymentStatus === "FAILED" ? (
              <>
                <Cancel sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
                <Typography variant="h6" fontWeight="700" color="error.main" mb={1}>
                  Payment Failed
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  The payment was not completed. This could be due to insufficient
                  M-Pesa balance, wrong PIN, or cancellation.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => {
                    dispatch(clearMpesaState())
                    setActiveStep(0)
                    setPollCount(0)
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  Try Again
                </Button>
              </>
            ) : (
              <>
                <HourglassTop sx={{ fontSize: 64, color: "warning.main", mb: 2 }} />
                <Typography variant="h6" fontWeight="700" mb={1}>
                  Payment Timeout
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  We couldn't confirm your payment automatically. If you completed
                  the payment, it will be processed shortly.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => {
                    setPollCount(0)
                    dispatch(checkMpesaStatus(transactionReference))
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  Check Again
                </Button>
              </>
            )}
          </Box>
        )}

        {/* ── STEP 2: Success ── */}
        {activeStep === 2 && (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <CheckCircle sx={{ fontSize: 72, color: "#1D9E75", mb: 2 }} />
            <Typography variant="h5" fontWeight="800" color="#1D9E75" mb={1}>
              Payment Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {mode === "order"
                ? "Your order has been confirmed. You'll receive an email confirmation shortly."
                : "Your license has been activated. Check your email for the license key."}
            </Typography>

            {mpesaReceipt && (
              <Box sx={{
                bgcolor: "#E8F5E9", borderRadius: 2,
                px: 2.5, py: 2, mb: 2, textAlign: "left",
              }}>
                <Typography variant="caption" color="text.secondary" fontWeight="600">
                  M-PESA RECEIPT
                </Typography>
                <Typography variant="h6" fontWeight="800" fontFamily="monospace" color="#1a1a2e">
                  {mpesaReceipt}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Keep this receipt for your records
                </Typography>
              </Box>
            )}

            <Divider sx={{ mb: 2 }} />
            <Typography variant="caption" color="text.secondary">
              Powered by Lipia Online · PhinTech Solutions — Built in Kenya 🇰🇪
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        {activeStep === 0 && (
          <>
            <Button onClick={handleClose} sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <Lock />}
              sx={{
                borderRadius: 2, px: 3,
                background: "linear-gradient(135deg, #1D9E75 0%, #27AE7F 100%)",
                "&:hover": { background: "linear-gradient(135deg, #16805E 0%, #1D9E75 100%)" },
              }}
            >
              {isLoading ? "Sending..." : "Send STK Push"}
            </Button>
          </>
        )}

        {activeStep === 1 && paymentStatus !== "FAILED" && !isTimedOut && (
          <Button onClick={handleClose} color="inherit" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
        )}

        {activeStep === 2 && (
          <Button
            variant="contained"
            onClick={handleDone}
            fullWidth
            sx={{
              borderRadius: 2, py: 1.5,
              background: "linear-gradient(135deg, #1D9E75 0%, #27AE7F 100%)",
            }}
          >
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default MpesaPaymentModal
