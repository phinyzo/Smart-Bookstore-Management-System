import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { addToCart } from "../../features/cart/cartSlice"
import { formatKES } from "../../utils/formatPrice"
import {
  Card, CardMedia, CardContent, CardActions,
  Typography, Button, Chip, Box, Tooltip
} from "@mui/material"
import { ShoppingCart, Visibility } from "@mui/icons-material"

const BookCard = ({ book }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return (
    <Card sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      borderRadius: 3,
      border: "1px solid #e8e8e8",
      boxShadow: "none",
      transition: "all 0.2s",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        borderColor: "#534AB7",
      },
    }}>

      {/* ── Book Cover Image ── */}
      <Box sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "12px 12px 0 0",
        bgcolor: "#f5f5f5",
        cursor: "pointer",
      }}
        onClick={() => navigate(`/books/${book._id}`)}>
        <CardMedia
          component="img"
          image={book.imageUrl ||
            "https://via.placeholder.com/300x420?text=No+Cover"}
          alt={book.title}
          sx={{
            width: "100%",
            height: 280,            
            objectFit: "cover",    
            objectPosition: "center top", 
            transition: "transform 0.3s",
            "&:hover": {
              transform: "scale(1.04)",
            },
          }}
        />
        {/* Out of stock overlay */}
        {book.stock === 0 && (
          <Box sx={{
            position: "absolute",
            top: 0, left: 0,
            width: "100%", height: "100%",
            bgcolor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Typography variant="body2" fontWeight="700"
              color="#fff" sx={{
                bgcolor: "#E24B4A",
                px: 2, py: 0.5, borderRadius: 2,
              }}>
              Out of Stock
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Card Body ── */}
      <CardContent sx={{ flex: 1, pb: 1, px: 2, pt: 1.5 }}>

        <Chip
          label={book.genre || "General"}
          size="medium"
          color="primary"
          variant="outlined"
          sx={{ mb: 1, fontSize: "11px", height: 22 }}
        />

        <Tooltip title={book.title} placement="top">
          <Typography
            variant="subtitle1"
            fontWeight="700"
            color="#1a1a2e"
            sx={{
              cursor: "pointer",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.3,
              mb: 0.5,
              fontSize: "14px",
              "&:hover": { color: "primary.main" },
            }}
            onClick={() => navigate(`/books/${book._id}`)}
          >
            {book.title}
          </Typography>
        </Tooltip>

        <Typography variant="body2" color="text.secondary"
          fontSize="12px" gutterBottom>
          by {book.author}
        </Typography>

        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 1,
        }}>
          <Typography variant="h6" color="success.main"
            fontWeight="800" fontSize="18px">
            {formatKES(book.price)}
          </Typography>
          <Typography variant="caption" fontWeight="500"
            color={book.stock > 0
              ? "success.main" : "error.main"}>
            {book.stock > 0
              ? `${book.stock} left` : "Sold out"}
          </Typography>
        </Box>

      </CardContent>

      {/* ── Action Buttons ── */}
      <CardActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
        <Button
          variant="contained"
          size="medium"
          fullWidth
          startIcon={<ShoppingCart fontSize="small" />}
          disabled={book.stock === 0}
          onClick={() => dispatch(addToCart(book))}
          sx={{
            borderRadius: 2,
            fontSize: "12px",
            fontWeight: 600,
            py: 0.8,
          }}
        >
          Add to Cart
        </Button>
        <Button
          variant="outlined"
          size="medium"
          onClick={() => navigate(`/books/${book._id}`)}
          sx={{
            borderRadius: 2,
            minWidth: "auto",
            px: 1.5,
            py: 0.8,
            flexShrink: 0,
          }}
        >
          <Visibility fontSize="small" />
        </Button>
      </CardActions>

    </Card>
  )
}

export default BookCard