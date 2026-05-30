/**
 * LicensePage
 * Shows the user's current license status, pricing plans,
 * and allows upgrading via M-Pesa.
 */

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchLicenseStatus, fetchPricing } from "../../features/license/licenseSlice"
import MpesaPaymentModal from "../../components/payment/MpesaPaymentModal"
import { formatKES } from "../../utils/formatPrice"
import {
  Box, Typography, Paper, Grid, Card, CardContent,
  Button, Chip, CircularProgress, Divider,
  List, ListItem, ListItemIcon, ListItemText, Alert
} from "@mui/material"
import {
  CheckCircle, Star, Bolt, AllInclusive,
  VpnKey, CalendarToday, Autorenew, Lock
} from "@mui/icons-material"

const LicensePage = () => {
  const dispatch = useDispatch()
  const { status, pricing, isLoading } = useSelector((state) => state.license)

  const [selectedPlan, setSelectedPlan] = useState(null)
  const [mpesaOpen, setMpesaOpen]       = useState(false)

  useEffect(() => {
    dispatch(fetchLicenseStatus())
    dispatch(fetchPricing())
  }, [dispatch])

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan)
    setMpesaOpen(true)
  }

  const handleMpesaSuccess = () => {
    setMpesaOpen(false)
    dispatch(fetchLicenseStatus())
  }

  const statusColors = {
    active:   { color: "#1D9E75", bg: "#E8F5E9", label: "Active" },
    trial:    { color: "#EF9F27", bg: "#FFF8E1", label: "Trial" },
    expired:  { color: "#E24B4A", bg: "#FFEBEE", label: "Expired" },
    suspended:{ color: "#9E9E9E", bg: "#F5F5F5", label: "Suspended" },
  }

  const currentStatusKey = status?.status || "expired"
  const statusStyle = statusColors[currentStatusKey] || statusColors.expired

  if (isLoading && !status) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: "#f0f2f5", minHeight: "100vh", width: "100%" }}>

      {/* ── Header ── */}
      <Box sx={{
        bgcolor: "#fff",
        borderBottom: "1px solid #e8e8e8",
        px: { xs: 2, md: 6 },
        py: 1.5,
      }}>
        <Typography variant="h5" fontWeight="800" color="#1a1a2e">
          License & Subscription
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your Smart Bookstore license
        </Typography>
      </Box>

      <Box sx={{ px: { xs: 2, md: 6 }, py: 4, maxWidth: 1100, mx: "auto" }}>

        {/* ── Current Status Card ── */}
        {status && (
          <Paper elevation={0} sx={{
            borderRadius: 3, p: 3, mb: 4,
            border: `2px solid ${statusStyle.color}`,
            bgcolor: statusStyle.bg,
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                  <VpnKey sx={{ color: statusStyle.color }} />
                  <Typography variant="h6" fontWeight="700" color="#1a1a2e">
                    Current License
                  </Typography>
                  <Chip
                    label={statusStyle.label}
                    size="small"
                    sx={{ bgcolor: statusStyle.color, color: "#fff", fontWeight: 700 }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" mb={1}>
                  {status.message}
                </Typography>

                {status.licenseKey && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">License Key:</Typography>
                    <Typography variant="caption" fontFamily="monospace" fontWeight="700" color="#534AB7">
                      {status.licenseKey}
                    </Typography>
                  </Box>
                )}

                {status.expiresAt && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                    <CalendarToday sx={{ fontSize: 14, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                      Expires: {new Date(status.expiresAt).toLocaleDateString("en-KE", { dateStyle: "long" })}
                    </Typography>
                  </Box>
                )}

                {status.trialEndsAt && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                    <CalendarToday sx={{ fontSize: 14, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                      Trial ends: {new Date(status.trialEndsAt).toLocaleDateString("en-KE", { dateStyle: "long" })}
                    </Typography>
                  </Box>
                )}
              </Box>

              {status.licenseType === "one_time" && (
                <Chip
                  icon={<AllInclusive />}
                  label="Lifetime License"
                  color="success"
                  sx={{ fontWeight: 700 }}
                />
              )}

              {["monthly", "annual"].includes(status.licenseType) && status.isActive && (
                <Button
                  variant="outlined"
                  startIcon={<Autorenew />}
                  onClick={() => handleSelectPlan(
                    pricing?.plans?.find((p) => p.id === status.licenseType)
                  )}
                  sx={{ borderRadius: 2 }}
                >
                  Renew Early
                </Button>
              )}
            </Box>
          </Paper>
        )}

        {/* ── Expired alert ── */}
        {status && !status.isActive && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2" fontWeight="600">
              {status.licenseType === "trial"
                ? "Your 14-day free trial has expired."
                : "Your license has expired."}{" "}
              Choose a plan below to restore access.
            </Typography>
          </Alert>
        )}

        {/* ── Pricing Plans ── */}
        <Typography variant="h6" fontWeight="700" color="#1a1a2e" mb={2}>
          Available Plans
        </Typography>

        {isLoading && !pricing ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : pricing ? (
          <Grid container spacing={3} mb={4}>
            {pricing.plans
              .filter((p) => p.id !== "trial")
              .map((plan) => {
                const isCurrentPlan = status?.licenseType === plan.id && status?.isActive
                const iconMap = {
                  monthly:  <Bolt sx={{ color: "#534AB7" }} />,
                  annual:   <CheckCircle sx={{ color: "#1D9E75" }} />,
                  one_time: <AllInclusive sx={{ color: "#E24B4A" }} />,
                }
                const colorMap = {
                  monthly:  "#534AB7",
                  annual:   "#1D9E75",
                  one_time: "#E24B4A",
                }
                const color = colorMap[plan.id] || "#534AB7"

                return (
                  <Grid item xs={12} sm={6} md={4} key={plan.id}>
                    <Card elevation={0} sx={{
                      border: `2px solid ${isCurrentPlan ? color : "#e8e8e8"}`,
                      borderRadius: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: color,
                        boxShadow: `0 4px 20px ${color}30`,
                        transform: "translateY(-2px)",
                      },
                    }}>
                      <CardContent sx={{ flex: 1, p: 3 }}>
                        {plan.badge && (
                          <Chip
                            label={plan.badge}
                            size="small"
                            sx={{ bgcolor: color, color: "#fff", fontWeight: 700, mb: 1.5, fontSize: "11px" }}
                          />
                        )}

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          {iconMap[plan.id]}
                          <Typography variant="subtitle1" fontWeight="700">{plan.name}</Typography>
                        </Box>

                        <Typography variant="h4" fontWeight="800" color={color} mb={0.5}>
                          {formatKES(plan.price)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                          {plan.duration}
                        </Typography>

                        {plan.savings && (
                          <Chip label={plan.savings} size="small" color="success"
                            sx={{ mb: 1.5, fontWeight: 600, fontSize: "11px" }} />
                        )}

                        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                          {plan.description}
                        </Typography>

                        <Divider sx={{ mb: 1.5 }} />

                        <List dense disablePadding>
                          {plan.features.map((f) => (
                            <ListItem key={f} disablePadding sx={{ py: 0.3 }}>
                              <ListItemIcon sx={{ minWidth: 28 }}>
                                <CheckCircle sx={{ fontSize: 16, color }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={f}
                                primaryTypographyProps={{ variant: "caption", color: "#333" }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>

                      <Box sx={{ p: 3, pt: 0 }}>
                        {isCurrentPlan ? (
                          <Chip
                            label="Current Plan"
                            fullWidth
                            sx={{ width: "100%", bgcolor: color, color: "#fff", fontWeight: 700, py: 2.5 }}
                          />
                        ) : (
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => handleSelectPlan(plan)}
                            sx={{
                              borderRadius: 2, py: 1.3, fontWeight: 700,
                              bgcolor: color,
                              "&:hover": { bgcolor: color, filter: "brightness(0.9)" },
                            }}
                          >
                            Pay with M-Pesa
                          </Button>
                        )}
                      </Box>
                    </Card>
                  </Grid>
                )
              })}
          </Grid>
        ) : null}

        {/* ── Footer branding ── */}
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography variant="caption" color="text.secondary">
            Payments processed securely via M-Pesa · Lipia Online ·{" "}
            <a
              href="https://phintechsolutions.com"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#534AB7", textDecoration: "none" }}
            >
              PhinTech Solutions
            </a>{" "}
            — Built in Kenya 🇰🇪
          </Typography>
        </Box>
      </Box>

      {/* M-Pesa modal */}
      {selectedPlan && (
        <MpesaPaymentModal
          open={mpesaOpen}
          onClose={() => setMpesaOpen(false)}
          onSuccess={handleMpesaSuccess}
          mode="license"
          licenseType={selectedPlan.id}
          amount={selectedPlan.price}
        />
      )}
    </Box>
  )
}

export default LicensePage
