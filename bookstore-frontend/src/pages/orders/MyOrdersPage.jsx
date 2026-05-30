import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { fetchMyOrders } from "../../features/orders/orderSlice"
import { formatKES } from "../../utils/formatPrice"
import {
  Box, Typography, Card, CardContent, Chip,
  Button, CircularProgress, Divider, Stack
} from "@mui/material"
import {
  Visibility, ShoppingBag, ArrowForward,
  CalendarToday, ReceiptLong
} from "@mui/icons-material"

// ── Status color map ───────────────────────────────────────────
const statusColor = {
  Created:    "info",
  Confirmed:  "success",
  Processing: "warning",
  Shipped:    "primary",
  Delivered:  "success",
  Cancelled:  "error",
}

const paymentColor = {
  Paid:    "success",
  Pending: "warning",
  Failed:  "error",
}

// ── Component ─────────────────────────────────────────────────
const MyOrdersPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { orders, isLoading } = useSelector((state) => state.orders)

  useEffect(() => {
    dispatch(fetchMyOrders())
  }, [dispatch])

  if (isLoading) return (
    <Box sx={{ display: "flex", justifyContent: "center",
      alignItems: "center", minHeight: "60vh" }}>
      <CircularProgress size={48} />
    </Box>
  )

  return (
    <Box sx={{ bgcolor: "#f0f2f5", minHeight: "100vh", width: "100%" }}>

      {/* ── Page Header ── */}
      <Box sx={{
        bgcolor: "#fff",
        borderBottom: "1px solid #e8e8e8",
        px: { xs: 2, md: 6 },
        py: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ReceiptLong color="primary" />
          <Box>
            <Typography variant="h5" fontWeight="800" color="#1a1a2e">
              My Orders
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {orders.length} {orders.length === 1 ? "order" : "orders"} placed
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ShoppingBag />}
          onClick={() => navigate("/books")}
          sx={{ borderRadius: 2 }}
        >
          Browse Books
        </Button>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>

        {orders.length === 0 ? (
          <Box sx={{
            textAlign: "center", py: 10,
            bgcolor: "#fff", borderRadius: 3,
          }}>
            <ShoppingBag sx={{ fontSize: 64,
              color: "#ddd", mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              No orders yet!
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Browse our collection and place your first order
            </Typography>
            <Button variant="contained"
              onClick={() => navigate("/books")}
              sx={{ borderRadius: 2, px: 4 }}>
              Browse Books
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {orders.map((order, index) => (
              <Card key={order._id} elevation={0} sx={{
                borderRadius: 3,
                border: "1px solid #e8e8e8",
                bgcolor: "#fff",
                transition: "all 0.2s",
                "&:hover": {
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  borderColor: "#534AB7",
                },
              }}>
                <CardContent sx={{ p: 3 }}>

                  {/* ── Top Row ── */}
                  <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}>
                    <Box sx={{
                      display: "flex", alignItems: "center", gap: 2,
                    }}>
                      {/* Order number badge */}
                      <Box sx={{
                        bgcolor: "#EEEDFE",
                        color: "#534AB7",
                        borderRadius: 2,
                        px: 1.5, py: 0.8,
                        fontWeight: 800,
                        fontSize: "13px",
                        flexShrink: 0,
                      }}>
                        #{String(index + 1).padStart(2, "0")}
                      </Box>
                      <Box>
                        <Typography variant="body2"
                          color="text.secondary" fontSize="11px">
                          ORDER ID
                        </Typography>
                        <Typography variant="body1"
                          fontWeight="700" color="#1a1a2e"
                          fontFamily="monospace">
                          {order._id.slice(-12).toUpperCase()}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Status badges */}
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={order.orderStatus}
                        color={statusColor[order.orderStatus] || "default"}
                        size="medium"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        label={order.paymentStatus}
                        color={paymentColor[order.paymentStatus] || "default"}
                        size="medium"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Stack>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* ── Middle Row ── */}
                  <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}>

                    {/* Date */}
                    <Box sx={{
                      display: "flex", alignItems: "center", gap: 1,
                    }}>
                      <CalendarToday sx={{
                        fontSize: 16, color: "text.secondary",
                      }} />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.createdAt).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </Typography>
                    </Box>

                    {/* Shipping address */}
                    <Typography variant="body2" color="text.secondary"
                      sx={{
                        flex: 1, mx: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: { xs: "none", sm: "block" },
                      }}>
                      📍 {order.shippingAddress}
                    </Typography>

                    {/* Total + View button */}
                    <Box sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="caption"
                          color="text.secondary" display="block">
                          Order Total
                        </Typography>
                        <Typography variant="h6" fontWeight="800"
                          color="success.main">
                          {formatKES(order.totalPrice)}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        size="medium"
                        endIcon={<ArrowForward />}
                        onClick={() => navigate(`/orders/${order._id}`)}
                        sx={{
                          borderRadius: 2,
                          px: 2,
                          fontWeight: 600,
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Box>

                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  )
}

export default MyOrdersPage