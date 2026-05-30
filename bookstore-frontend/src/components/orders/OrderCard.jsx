import { useNavigate } from "react-router-dom"
import { Box, Typography, Card, CardContent, Chip, Button, Grid } from "@mui/material"
import { Visibility } from "@mui/icons-material"
import OrderStatusBadge from "./OrderStatusBadge"
import { formatKES } from "../../utils/formatPrice"

const OrderCard = ({ order }) => {
  const navigate = useNavigate()

  return (
    <Card sx={{ mb: 2, borderRadius: 3 }}>
      <CardContent>
        <Grid container alignItems="center" spacing={2}>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">Order ID</Typography>
            <Typography fontWeight="600">#{order._id.slice(-8).toUpperCase()}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(order.createdAt).toLocaleDateString("en-KE", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={2}>
            <Typography variant="subtitle2" color="text.secondary">Total</Typography>
            <Typography fontWeight="bold" color="success.main">
              {formatKES(order.totalPrice)}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <OrderStatusBadge status={order.orderStatus} />
              <Chip
                label={order.paymentStatus}
                color={order.paymentStatus === "Paid" ? "success" : "warning"}
                size="medium"
                variant="outlined"
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={3} sx={{ textAlign: "right" }}>
            <Button
              variant="outlined"
              size="medium"
              startIcon={<Visibility />}
              onClick={() => navigate(`/orders/${order._id}`)}
              sx={{ borderRadius: 2 }}
            >
              View Details
            </Button>
          </Grid>

        </Grid>
      </CardContent>
    </Card>
  )
}

export default OrderCard
