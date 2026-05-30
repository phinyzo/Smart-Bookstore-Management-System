import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  removeFromCart, updateQuantity,
  clearCart, selectCartTotal
} from "../../features/cart/cartSlice"
import { formatKES } from "../../utils/formatPrice"
import {
  Box, Typography, Button, IconButton,
  Divider, Paper, Stack, Chip, Avatar
} from "@mui/material"
import {
  Add, Remove, Delete, ShoppingCartCheckout,
  ArrowBack, DeleteSweep, ShoppingBag
} from "@mui/icons-material"

const CartPage = () => {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const { items }  = useSelector((state) => state.cart)
  const total      = useSelector(selectCartTotal)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  if (items.length === 0) return (
    <Box sx={{
      minHeight: "100vh", bgcolor: "#f0f2f5",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      <ShoppingBag sx={{ fontSize: 72, color: "#ddd", mb: 2 }} />
      <Typography variant="h5" fontWeight="bold" gutterBottom>Your cart is empty</Typography>
      <Typography color="text.secondary" mb={3}>Add some books to get started!</Typography>
      <Button variant="contained" size="large" onClick={() => navigate("/books")}
        sx={{ borderRadius: 2, px: 5, py: 1.5 }}>
        Browse Books
      </Button>
    </Box>
  )

  return (
    <Box sx={{ bgcolor: "#f0f2f5", minHeight: "100vh", width: "100%" }}>

      {/* ── Header ── */}
      <Box sx={{
        bgcolor: "#fff", borderBottom: "1px solid #e8e8e8",
        px: { xs: 2, md: 6 }, py: 1.5,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Box>
          <Typography variant="h5" fontWeight="800" color="#1a1a2e">🛒 Shopping Cart</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {items.length} {items.length === 1 ? "book" : "books"} · {totalItems}{" "}
            {totalItems === 1 ? "item" : "items"} · Total {formatKES(total)}
          </Typography>
        </Box>
        <Button startIcon={<ArrowBack />} variant="outlined"
          onClick={() => navigate("/books")} sx={{ borderRadius: 2 }}>
          Continue Shopping
        </Button>
      </Box>

      {/* ── Body ── */}
      <Box sx={{
        maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: 4,
        display: "flex", gap: 3,
        flexDirection: { xs: "column", md: "row" }, alignItems: "flex-start",
      }}>

        {/* ── LEFT: Items ── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight="700" color="#1a1a2e">
              Your Items ({items.length})
            </Typography>
            <Button size="medium" color="error" variant="outlined"
              startIcon={<DeleteSweep />} onClick={() => dispatch(clearCart())}
              sx={{ borderRadius: 2, fontSize: "12px" }}>
              Clear All
            </Button>
          </Box>

          <Stack spacing={2}>
            {items.map((item, index) => (
              <Paper key={item._id} elevation={0} sx={{
                borderRadius: 3, p: 2.5,
                display: "flex", gap: 2, alignItems: "center",
                border: "1px solid #e8e8e8", bgcolor: "#fff",
                transition: "all 0.2s",
                "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)", borderColor: "#534AB7" },
              }}>
                <Avatar sx={{ width: 30, height: 30, bgcolor: "#534AB7", fontSize: "13px", fontWeight: 700, flexShrink: 0 }}>
                  {index + 1}
                </Avatar>

                <Box component="img"
                  src={item.imageUrl || "https://via.placeholder.com/70x100"}
                  alt={item.title}
                  onClick={() => navigate(`/books/${item._id}`)}
                  sx={{
                    width: 65, height: 90, objectFit: "cover", borderRadius: 1.5,
                    cursor: "pointer", flexShrink: 0, boxShadow: 2,
                    transition: "transform 0.2s", "&:hover": { transform: "scale(1.05)" },
                  }}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight="700" color="#1a1a2e" noWrap
                    sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
                    onClick={() => navigate(`/books/${item._id}`)}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={0.8}>
                    by {item.author}
                  </Typography>
                  <Chip label={item.genre} size="medium" color="primary" variant="outlined"
                    sx={{ fontSize: "11px", height: 22 }} />
                </Box>

                {/* Unit price */}
                <Box sx={{ textAlign: "center", px: 1.5, display: { xs: "none", sm: "block" } }}>
                  <Typography variant="caption" color="text.secondary" display="block">Unit Price</Typography>
                  <Typography variant="body1" fontWeight="700" color="primary.main">
                    {formatKES(item.price)}
                  </Typography>
                </Box>

                {/* Qty control */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Quantity</Typography>
                  <Box sx={{
                    display: "flex", alignItems: "center",
                    border: "2px solid", borderColor: "primary.main",
                    borderRadius: 2, overflow: "hidden", bgcolor: "#f8f7ff",
                  }}>
                    <IconButton size="medium"
                      onClick={() => dispatch(updateQuantity({ id: item._id, quantity: Math.max(1, item.quantity - 1) }))}
                      sx={{ borderRadius: 0, px: 1, "&:hover": { bgcolor: "#EDE7F6" } }}>
                      <Remove fontSize="small" />
                    </IconButton>
                    <Typography sx={{ px: 2, fontWeight: "800", fontSize: "16px", minWidth: 36, textAlign: "center", color: "#534AB7" }}>
                      {item.quantity}
                    </Typography>
                    <IconButton size="medium"
                      onClick={() => dispatch(updateQuantity({ id: item._id, quantity: Math.min(item.stock, item.quantity + 1) }))}
                      sx={{ borderRadius: 0, px: 1, "&:hover": { bgcolor: "#EDE7F6" } }}>
                      <Add fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Subtotal */}
                <Box sx={{ textAlign: "center", minWidth: 90 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Subtotal</Typography>
                  <Typography variant="h6" fontWeight="800" color="success.main">
                    {formatKES(item.price * item.quantity)}
                  </Typography>
                </Box>

                <IconButton onClick={() => dispatch(removeFromCart(item._id))}
                  sx={{
                    bgcolor: "#FFF5F5", border: "1px solid #FFCDD2", color: "error.main",
                    "&:hover": { bgcolor: "#FFEBEE", transform: "scale(1.1)" }, transition: "all 0.2s",
                  }}>
                  <Delete fontSize="small" />
                </IconButton>
              </Paper>
            ))}
          </Stack>
        </Box>

        {/* ── RIGHT: Order Summary ── */}
        <Box sx={{ width: { xs: "100%", md: 340 }, flexShrink: 0, position: { md: "sticky" }, top: 80 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #e8e8e8", mb: 2 }}>
            <Box sx={{
              bgcolor: "#f5f5f5", borderBottom: "1px solid #e8e8e8",
              px: 3, py: 2, display: "flex", alignItems: "center", gap: 1,
            }}>
              <Typography variant="h6" fontWeight="bold" color="#1a1a2e">Order Summary</Typography>
              <Chip label={`${items.length} items`} size="medium" color="primary" variant="outlined"
                sx={{ ml: "auto", fontWeight: 600 }} />
            </Box>

            <Box sx={{ p: 3 }}>
              <Stack spacing={2} mb={2.5}>
                {items.map((item) => (
                  <Box key={item._id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight="600" color="#1a1a2e" noWrap>{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatKES(item.price)} × {item.quantity}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="700" flexShrink={0}>
                      {formatKES(item.price * item.quantity)}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography color="text.secondary" variant="body2">Subtotal ({totalItems} items)</Typography>
                <Typography variant="body2" fontWeight="600">{formatKES(total)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography color="text.secondary" variant="body2">Delivery Charges</Typography>
                <Chip label="FREE" size="medium" color="success" sx={{ height: 20, fontSize: "11px", fontWeight: 700 }} />
              </Box>

              <Box sx={{ bgcolor: "#E8F5E9", borderRadius: 2, px: 2, py: 1.5, mb: 2.5,
                display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="success.main" fontWeight="600">🎉 Free delivery!</Typography>
                <Typography variant="body2" color="success.main" fontWeight="700">KES 0</Typography>
              </Box>

              <Divider sx={{ mb: 2.5 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight="800">Total</Typography>
                  <Typography variant="caption" color="text.secondary">Inclusive of all taxes</Typography>
                </Box>
                <Typography variant="h4" fontWeight="800" color="success.main">
                  {formatKES(total)}
                </Typography>
              </Box>

              <Button variant="contained" fullWidth size="large"
                startIcon={<ShoppingCartCheckout />}
                onClick={() => navigate("/checkout")}
                sx={{
                  borderRadius: 2, py: 1.8, fontSize: "15px", fontWeight: 700, mb: 1.5,
                  background: "linear-gradient(135deg, #534AB7 0%, #7B75D0 100%)",
                  "&:hover": { background: "linear-gradient(135deg, #3D3490 0%, #534AB7 100%)" },
                }}>
                Proceed to Checkout
              </Button>

              <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                🔒 Secure checkout · M-Pesa & Card accepted
              </Typography>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e8e8e8", textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Accepted payment methods
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" gap={0.5}>
              {["📱 M-Pesa", "💳 Visa", "💳 Mastercard"].map((p) => (
                <Chip key={p} label={p} size="medium" variant="outlined" sx={{ fontSize: "11px" }} />
              ))}
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default CartPage
