import { Box, Typography, Link, Divider } from "@mui/material"

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        background:  "#1a1a2e",
        color:       "#888",
        textAlign:   "center",
        py: 2.5,
        px: 4,
        mt: "auto",
      }}
    >
      <Typography variant="body2" sx={{ fontSize: "13px", color: "#aaa" }}>
        © {new Date().getFullYear()} Smart Bookstore Management System. All rights reserved.
      </Typography>

      <Divider sx={{ borderColor: "#2a2a3e", my: 1, maxWidth: 400, mx: "auto" }} />

      <Typography variant="caption" sx={{ fontSize: "12px", color: "#666" }}>
        Powered by{" "}
        <Link
          href="https://phintechsolutions.com"
          target="_blank"
          rel="noreferrer"
          underline="hover"
          sx={{ color: "#7F77DD", fontWeight: 600 }}
        >
          PhinTech Solutions
        </Link>
        {" "}— Built in Kenya 🇰🇪
      </Typography>
    </Box>
  )
}

export default Footer
