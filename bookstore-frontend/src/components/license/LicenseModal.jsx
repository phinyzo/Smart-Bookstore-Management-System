/**
 * LicenseModal
 * Shown when a user's trial has expired or license is inactive.
 * Displays pricing plans and initiates M-Pesa payment.
 */

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchPricing } from "../../features/license/licenseSlice"
import MpesaPaymentModal from "../payment/MpesaPaymentModal"
import { formatKES } from "../../utils/formatPrice"
import {
  Dialog, DialogTitle, DialogContent,
  Button, Typography, Box, Grid, Card,
  CardContent, Chip, Divider, CircularProgress,
  List, ListItem, ListItemIcon, ListItemText
} from "@mui/material"
import {
  CheckCircle, Star, Bolt, AllInclusive, Lock
} from "@mui/icons-material"

const LicenseModal = ({ open, onClose }) => {
  const dispatch = useDispatch()
  const { pricing, isLoading } = useSelector((state) => state.license)
  const { user }               = useSelector((state) => state.auth)

  const [selectedPlan, setSelectedPlan]   = useState(null)
  const [mpesaOpen, setMpesaOpen]         = useState(false)

  useEffect(() => {
    if (open && !pricing) dispatch(fetchPricing())
  }, [open])

  const handleSelectPlan = (plan) => {
    if (plan.id === "trial") return
    setSelectedPlan(plan)
    setMpesaOpen(true)
  }

  const handleMpesaSuccess = () => {
    setMpesaOpen(false)
    onClose()
  }

  const planIcons = {
    trial:    <Star sx={{ color: "#EF9F27" }} />,
    monthly:  <Bolt sx={{ color: "#534AB7" }} />,
    annual:   <CheckCircle sx={{ color: "#1D9E75" }} />,
    one_time: <AllInclusive sx={{ color: "#E24B4A" }} />,
  }

  const planColors = {
    trial:    { border: "#EF9F27", bg: "#FFF8E1", btn: "#EF9F27" },
    monthly:  { border: "#534AB7", bg: "#EDE7F6", btn: "#534AB7" },
    annual:   { border: "#1D9E75", bg: "#E8F5E9", btn: "#1D9E75" },
    one_time: { border: "#E24B4A", bg: "#FFEBEE", btn: "#E24B4A" },
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {/* ── Header ── */}
        <DialogTitle sx={{ bgcolor: "#1a1a2e", color: "#fff", pb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Lock sx={{ color: "#EF9F27" }} />
            <Box>
              <Typography variant="h6" fontWeight="700">
                Unlock Full Access
              </Typography>
              <Typography variant="caption" sx={{ color: "#9FE1CB" }}>
                Your free trial has expired — choose a plan to continue
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 4 }}>
          <Typography variant="body2" color="text.secondary" mb={3} textAlign="center">
            Smart Bookstore Management System · Powered by{" "}
            <a
              href="https://phintechsolutions.com"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#534AB7", textDecoration: "none", fontWeight: 600 }}
            >
              PhinTech Solutions
            </a>{" "}
            — Built in Kenya 🇰🇪
          </Typography>

          {isLoading || !pricing ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {pricing.plans
                .filter((p) => p.id !== "trial")
                .map((plan) => {
                  const colors = planColors[plan.id] || planColors.monthly
                  return (
                    <Grid item xs={12} sm={4} key={plan.id}>
                      <Card
                        elevation={0}
                        sx={{
                          border: `2px solid ${colors.border}`,
                          borderRadius: 3,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          transition: "all 0.2s",
                          "&:hover": {
                            boxShadow: `0 4px 20px ${colors.border}40`,
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <CardContent sx={{ flex: 1, p: 2.5 }}>
                          {/* Badge */}
                          {plan.badge && (
                            <Chip
                              label={plan.badge}
                              size="small"
                              sx={{
                                bgcolor: colors.border,
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "11px",
                                mb: 1.5,
                              }}
                            />
                          )}

                          {/* Icon + Name */}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            {planIcons[plan.id]}
                            <Typography variant="subtitle1" fontWeight="700" color="#1a1a2e">
                              {plan.name}
                            </Typography>
                          </Box>

                          {/* Price */}
                          <Typography variant="h4" fontWeight="800" color={colors.border} mb={0.5}>
                            {formatKES(plan.price)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                            {plan.duration}
                          </Typography>

                          {/* Savings */}
                          {plan.savings && (
                            <Chip
                              label={plan.savings}
                              size="small"
                              color="success"
                              sx={{ mb: 1.5, fontWeight: 600, fontSize: "11px" }}
                            />
                          )}

                          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                            {plan.description}
                          </Typography>

                          <Divider sx={{ mb: 1.5 }} />

                          {/* Features */}
                          <List dense disablePadding>
                            {plan.features.map((f) => (
                              <ListItem key={f} disablePadding sx={{ py: 0.3 }}>
                                <ListItemIcon sx={{ minWidth: 28 }}>
                                  <CheckCircle sx={{ fontSize: 16, color: colors.border }} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={f}
                                  primaryTypographyProps={{ variant: "caption", color: "#333" }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>

                        {/* CTA Button */}
                        <Box sx={{ p: 2.5, pt: 0 }}>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => handleSelectPlan(plan)}
                            sx={{
                              borderRadius: 2,
                              py: 1.2,
                              fontWeight: 700,
                              bgcolor: colors.btn,
                              "&:hover": { bgcolor: colors.btn, filter: "brightness(0.9)" },
                            }}
                          >
                            Pay with M-Pesa
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  )
                })}
            </Grid>
          )}

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              All payments processed securely via M-Pesa · Lipia Online
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* M-Pesa payment modal */}
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
    </>
  )
}

export default LicenseModal
