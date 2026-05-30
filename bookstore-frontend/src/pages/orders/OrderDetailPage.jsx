import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchOrderById } from "../../features/orders/orderSlice"
import { formatKES } from "../../utils/formatPrice"
import {
  Box, Grid, Typography, Card, CardContent,
  Chip, Button, Divider, CircularProgress
} from "@mui/material"
import { ArrowBack } from "@mui/icons-material"

const OrderDetailPage = () => {
  const { id }     = useParams()
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const { order, isLoading } = useSelector((state) => state.orders)

  useEffect(() => {
    dispatch(fetchOrderById(id))
  }, [dispatch, id])

  if (isLoading) return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
      <CircularProgress />
    </Box>
  )

  if (!order) return (
    <Box sx={{ textAlign: "center", py: 10 }}>
      <Typography color="text.secondary">Order not found</Typography>
    </Box>
  )

  const { order: orderData, items } = order

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", px: 3, py: 4 }}>

      <Button startIcon={<ArrowBack />} onClick={() => navigate("/orders")} sx={{ mb: 3 }}>
        Back to Orders
      </Button>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Order #{orderData._id.slice(-8).toUpperCase()}
        </Typography>
        <Chip label={orderData.orderStatus} color="primary" />
      </Box>

      <Grid container spacing={3}>

        {/* Items */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Items Ordered</Typography>
              {items?.map((item) => (
                <Box key={item._id} sx={{
                  display: "flex", gap: 2, py: 2, borderBottom: "1px solid #f5f5f5",
                }}>
                  <Box component="img"
                    src={item.bookId?.imageUrl || "https://via.placeholder.com/60x80"}
                    alt={item.bookId?.title}
                    sx={{ width: 55, height: 70, objectFit: "cover", borderRadius: 1 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight="600">
                      {item.bookId?.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatKES(item.price)} × {item.quantity}
                    </Typography>
                  </Box>
                  <Typography fontWeight="bold" color="success.main">
                    {formatKES(item.price * item.quantity)}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Info */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Order Info</Typography>

              {[
                { label: "Order Date",        value: new Date(orderData.createdAt).toLocaleDateString("en-KE") },
                { label: "Payment Status",    value: orderData.paymentStatus },
                { label: "Order Status",      value: orderData.orderStatus },
                { label: "Shipping Address",  value: orderData.shippingAddress },
              ].map(({ label, value }) => (
                <Box key={label} sx={{
                  display: "flex", justifyContent: "space-between",
                  py: 1.5, borderBottom: "1px solid #f5f5f5",
                }}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight="500"
                    sx={{ maxWidth: "55%", textAlign: "right" }}>
                    {value}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography fontWeight="bold" fontSize="16px">Total</Typography>
                <Typography fontWeight="bold" fontSize="20px" color="success.main">
                  {formatKES(orderData.totalPrice)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}

export default OrderDetailPage
