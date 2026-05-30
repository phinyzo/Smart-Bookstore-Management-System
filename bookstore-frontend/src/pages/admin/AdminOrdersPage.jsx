import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAllOrders, updateOrderStatus } from "../../features/orders/orderSlice"
import { formatKES } from "../../utils/formatPrice"
import {
  Box, Typography, Paper, Table, TableBody,
  TableCell, TableHead, TableRow, Chip, Select,
  MenuItem, CircularProgress, FormControl,
  InputLabel, Avatar
} from "@mui/material"
import { ReceiptLong } from "@mui/icons-material"

const statuses = ["Created", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"]

const statusColor = {
  Created:    "info",
  Confirmed:  "success",
  Processing: "warning",
  Shipped:    "primary",
  Delivered:  "success",
  Cancelled:  "error",
}

const AdminOrdersPage = () => {
  const dispatch = useDispatch()
  const { orders, isLoading } = useSelector((state) => state.orders)
  const [filterStatus, setFilterStatus] = useState("")

  useEffect(() => {
    dispatch(fetchAllOrders(filterStatus ? { status: filterStatus } : {}))
  }, [dispatch, filterStatus])

  const handleStatusChange = (orderId, newStatus) => {
    dispatch(updateOrderStatus({ id: orderId, orderStatus: newStatus }))
  }

  return (
    <Box sx={{ bgcolor: "#f0f2f5", minHeight: "100vh", width: "100%" }}>

      {/* ── Header ── */}
      <Box sx={{
        bgcolor: "#fff", borderBottom: "1px solid #e8e8e8",
        px: { xs: 2, md: 6 }, py: 2.5,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ReceiptLong color="primary" />
          <Box>
            <Typography variant="h5" fontWeight="800" color="#1a1a2e">Manage Orders</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {orders.length} total orders
            </Typography>
          </Box>
        </Box>
        <FormControl size="medium" sx={{ minWidth: 180 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select value={filterStatus} label="Filter by Status"
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ borderRadius: 2, bgcolor: "#fff" }}>
            <MenuItem value="">All Statuses</MenuItem>
            {statuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ px: { xs: 2, md: 6 }, py: 4 }}>
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e8e8e8", overflow: "auto" }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#fafafa" }}>
                  {["#", "Order ID", "Customer", "Total (KES)", "Payment", "Status", "Update Status", "Date"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: "700", color: "text.secondary", fontSize: "12px", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
                      {h.toUpperCase()}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order, index) => (
                  <TableRow key={order._id} sx={{ "&:hover": { bgcolor: "#f9f9f9" }, borderBottom: "1px solid #f5f5f5" }}>
                    <TableCell>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: "#EDE7F6", color: "#534AB7", fontSize: "12px", fontWeight: 700 }}>
                        {index + 1}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="700" fontFamily="monospace" color="#1a1a2e">
                        #{order._id.slice(-8).toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600" color="#1a1a2e">
                        {order.userId?.name || "—"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.userId?.email || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="700" color="success.main">
                        {formatKES(order.totalPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.paymentStatus}
                        color={order.paymentStatus === "Paid" ? "success" : order.paymentStatus === "Failed" ? "error" : "warning"}
                        size="medium"
                        sx={{ fontWeight: 600, fontSize: "11px" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.orderStatus}
                        color={statusColor[order.orderStatus] || "default"}
                        size="medium"
                        sx={{ fontWeight: 600, fontSize: "11px" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.orderStatus}
                        size="medium"
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        sx={{ minWidth: 140, fontSize: "13px", borderRadius: 2 }}
                      >
                        {statuses.map((s) => (
                          <MenuItem key={s} value={s} sx={{ fontSize: "13px" }}>{s}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" whiteSpace="nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-KE", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Box>
    </Box>
  )
}

export default AdminOrdersPage
