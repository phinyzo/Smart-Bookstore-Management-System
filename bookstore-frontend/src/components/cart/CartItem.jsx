import { useDispatch } from "react-redux"
import { removeFromCart, updateQuantity } from "../../features/cart/cartSlice"
import { formatKES } from "../../utils/formatPrice"
import { Box, Typography, IconButton, Card, CardContent } from "@mui/material"
import { Add, Remove, Delete } from "@mui/icons-material"

const CartItem = ({ item }) => {
  const dispatch = useDispatch()

  const handleIncrease = () => {
    dispatch(updateQuantity({ id: item._id, quantity: Math.min(item.stock, item.quantity + 1) }))
  }

  const handleDecrease = () => {
    dispatch(updateQuantity({ id: item._id, quantity: Math.max(1, item.quantity - 1) }))
  }

  const handleRemove = () => {
    dispatch(removeFromCart(item._id))
  }

  return (
    <Card sx={{ mb: 2, borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>

          <Box
            component="img"
            src={item.imageUrl || "https://via.placeholder.com/80x100"}
            alt={item.title}
            sx={{ width: 70, height: 90, objectFit: "cover", borderRadius: 2 }}
          />

          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="600">
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.author}
            </Typography>
            <Typography variant="body2" color="primary.main" fontWeight="500">
              {formatKES(item.price)} each
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>

            <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: 2 }}>
              <IconButton size="medium" onClick={handleDecrease}>
                <Remove fontSize="small" />
              </IconButton>
              <Typography sx={{ px: 2, fontWeight: "600" }}>
                {item.quantity}
              </Typography>
              <IconButton size="medium" onClick={handleIncrease}>
                <Add fontSize="small" />
              </IconButton>
            </Box>

            <Typography variant="h6" color="success.main" fontWeight="bold">
              {formatKES(item.price * item.quantity)}
            </Typography>

            <IconButton color="error" size="medium" onClick={handleRemove}>
              <Delete fontSize="small" />
            </IconButton>

          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CartItem
