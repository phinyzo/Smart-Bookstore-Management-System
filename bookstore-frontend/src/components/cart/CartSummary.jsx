import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { selectCartTotal } from "../../features/cart/cartSlice"
import { formatKES } from "../../utils/formatPrice"
import { Box, Typography, Button, Divider, Card, CardContent } from "@mui/material"
import { ShoppingCartCheckout, ArrowBack } from "@mui/icons-material"

const CartSummary = ({ items }) => {
  const navigate = useNavigate()
  const total    = useSelector(selectCartTotal)

  return (
    <Card sx={{ borderRadius: 3, position: "sticky", top: 80 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Order Summary
        </Typography>

        {items.map((item) => (
          <Box key={item._id} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {item.title} × {item.quantity}
            </Typography>
            <Typography variant="body2">
              {formatKES(item.price * item.quantity)}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">Total</Typography>
          <Typography variant="h6" fontWeight="bold" color="success.main">
            {formatKES(total)}
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<ShoppingCartCheckout />}
          onClick={() => navigate("/checkout")}
          sx={{ borderRadius: 2, py: 1.5 }}
        >
          Proceed to Checkout
        </Button>

        <Button
          fullWidth
          startIcon={<ArrowBack />}
          onClick={() => navigate("/books")}
          sx={{ mt: 1, borderRadius: 2 }}
        >
          Continue Shopping
        </Button>
      </CardContent>
    </Card>
  )
}

export default CartSummary
