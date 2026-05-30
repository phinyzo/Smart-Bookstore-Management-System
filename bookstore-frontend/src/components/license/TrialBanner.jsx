/**
 * TrialBanner
 * Shown to users on a free trial — displays days remaining
 * and a prompt to upgrade. Dismissible per session.
 */

import { useState } from "react"
import { useSelector } from "react-redux"
import LicenseModal from "./LicenseModal"
import { Box, Typography, Button, IconButton, Chip } from "@mui/material"
import { Close, Timer, Upgrade } from "@mui/icons-material"

const TrialBanner = () => {
  const { status }    = useSelector((state) => state.license)
  const { token }     = useSelector((state) => state.auth)
  const [dismissed, setDismissed] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // Only show for logged-in users on trial
  if (!token || !status) return null
  if (status.licenseType !== "trial" || !status.isActive) return null
  if (dismissed) return null

  const daysLeft = status.daysLeft || 0
  const isUrgent = daysLeft <= 3

  return (
    <>
      <Box sx={{
        bgcolor:    isUrgent ? "#FFF3E0" : "#E8F5E9",
        borderBottom: `2px solid ${isUrgent ? "#EF9F27" : "#1D9E75"}`,
        px: { xs: 2, md: 4 },
        py: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Timer sx={{ color: isUrgent ? "#EF9F27" : "#1D9E75", fontSize: 20 }} />
          <Typography variant="body2" fontWeight="600" color={isUrgent ? "#E65100" : "#1B5E20"}>
            Free Trial —{" "}
            <Chip
              label={`${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`}
              size="small"
              sx={{
                bgcolor:    isUrgent ? "#EF9F27" : "#1D9E75",
                color:      "#fff",
                fontWeight: 700,
                fontSize:   "11px",
                height:     20,
                mx: 0.5,
              }}
            />
            {isUrgent
              ? " Your trial is almost over. Upgrade now to keep access."
              : " Enjoying Smart Bookstore? Upgrade for full access."}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<Upgrade />}
            onClick={() => setModalOpen(true)}
            sx={{
              borderRadius: 2,
              fontWeight:   700,
              fontSize:     "12px",
              bgcolor:      isUrgent ? "#EF9F27" : "#1D9E75",
              "&:hover": {
                bgcolor: isUrgent ? "#E65100" : "#16805E",
              },
            }}
          >
            Upgrade Now
          </Button>
          <IconButton size="small" onClick={() => setDismissed(true)}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <LicenseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}

export default TrialBanner
