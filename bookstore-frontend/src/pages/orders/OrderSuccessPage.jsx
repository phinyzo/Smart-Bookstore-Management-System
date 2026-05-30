import { useNavigate } from "react-router-dom"
import { Box, Card, CardContent, Typography, Button, Divider } from "@mui/material"
import { CheckCircle, ListAlt, ShoppingBag } from "@mui/icons-material"

const OrderSuccessPage = () => {
  const navigate = useNavigate()

  return (
    <Box sx={{
      minHeight: "80vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      backgroundColor: "#f0f2f5", px: 2,
    }}>
      <Card sx={{ maxWidth: 480, width: "100%", borderRadius: 4, boxShadow: 5, textAlign: "center" }}>
        <CardContent sx={{ p: 5 }}>
          <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />

          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Order Placed!
          </Typography>

          <Typography variant="body1" color="text.secondary" mb={3}>
            Thank you for your purchase. A confirmation email has been sent to your inbox.
          </Typography>

          <Box sx={{ background: "#E8F5E9", borderRadius: 2, p: 2, mb: 4 }}>
            <Typography variant="body2" color="success.dark">
              Your order is being processed and will be shipped soon.
              Track your order status from the My Orders page.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button variant="contained" size="large" startIcon={<ListAlt />}
              onClick={() => navigate("/orders")}
              sx={{ borderRadius: 2, py: 1.5 }}>
              View My Orders
            </Button>
            <Button variant="outlined" size="large" startIcon={<ShoppingBag />}
              onClick={() => navigate("/books")}
              sx={{ borderRadius: 2, py: 1.5 }}>
              Continue Shopping
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" color="text.secondary">
            Powered by{" "}
            <a href="https://phintechsolutions.com" target="_blank" rel="noreferrer"
              style={{ color: "#534AB7", textDecoration: "none", fontWeight: 600 }}>
              PhinTech Solutions
            </a>{" "}
            — Built in Kenya 🇰🇪
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default OrderSuccessPage
