import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchBookById, clearBook } from "../../features/books/bookSlice"
import { addToCart } from "../../features/cart/cartSlice"
import { formatKES } from "../../utils/formatPrice"
import { toast } from "react-toastify"
import {
  Box, Typography, Button, Chip,
  CircularProgress, Divider, Paper, Stack
} from "@mui/material"
import {
  ShoppingCart, ArrowBack, Store,
  LocalOffer, Inventory2, MenuBook
} from "@mui/icons-material"

const BookDetailPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { book, isLoading } = useSelector((state) => state.books)

  useEffect(() => {
    dispatch(fetchBookById(id))
    return () => dispatch(clearBook())
  }, [dispatch, id])

  if (isLoading) return (
    <Box sx={{
      display: "flex", justifyContent: "center",
      alignItems: "center", minHeight: "80vh"
    }}>
      <CircularProgress size={48} />
    </Box>
  )

  if (!book) return (
    <Box sx={{ textAlign: "center", py: 10 }}>
      <Typography variant="h6" color="text.secondary">
        Book not found
      </Typography>
      <Button onClick={() => navigate("/books")} sx={{ mt: 2 }}>
        Back to Books
      </Button>
    </Box>
  )

  return (
    <Box sx={{ bgcolor: "#f0f2f5", minHeight: "100vh", width: "100%" }}>

      {/* ── Light Breadcrumb Header ── */}
      <Box sx={{
        bgcolor: "#fff",
        borderBottom: "1px solid #e8e8e8",
        px: { xs: 2, md: 6 },
        py: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/books")}
          size="medium"
          sx={{ color: "#534AB7", fontWeight: 300 }}
        >
          Back to Books
        </Button>
        <Typography color="text.disabled" variant="body2">
          /
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {book.genre}
        </Typography>
        <Typography color="text.disabled" variant="body2">
          /
        </Typography>
        <Typography variant="body2" fontWeight="600"
          color="#1a1a2e" noWrap
          sx={{ maxWidth: 200 }}>
          {book.title}
        </Typography>
      </Box>

      {/* ── Main Content ── */}
      <Box sx={{
        maxWidth: 1100, mx: "auto",
        px: { xs: 2, md: 4 },
        py: 4,
      }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 3, md: 6 },
            alignItems: "flex-start",
            justifyContent: "center", 
          }}
        >

          {/* ── LEFT: Image + Info Cards ── */}
          <Box sx={{
            width: { xs: "100%", md: 300 },
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: { md: "sticky" },
            top: 80,
          }}>

            {/* Book cover */}
            <Paper elevation={6} sx={{
              borderRadius: 3,
              overflow: "hidden",
              width: "100%",
              maxWidth: 280,
              mb: 3,
            }}>
              <Box
                component="img"
                src={book.imageUrl ||
                  "https://via.placeholder.com/300x420?text=No+Cover"}
                alt={book.title}
                sx={{
                  width: "100%",
                  height: 380,
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Paper>

            {/* Price + Stock cards */}
            <Box sx={{
              display: "flex", gap: 2,
              width: "100%", maxWidth: 280,
            }}>
              <Paper elevation={0} sx={{
                flex: 1, p: 2, borderRadius: 2,
                textAlign: "center",
                bgcolor: "#E8F5E9",
                border: "1px solid #C8E6C9",
              }}>
                <LocalOffer fontSize="small"
                  sx={{ color: "#1D9E75" }} />
                <Typography variant="caption"
                  color="text.secondary"
                  display="block" mt={0.5}>
                  Price
                </Typography>
                <Typography variant="h6" fontWeight="800"
                  color="#1D9E75">
                  {formatKES(book.price)}
                </Typography>
              </Paper>

              <Paper elevation={0} sx={{
                flex: 1, p: 2, borderRadius: 2,
                textAlign: "center",
                bgcolor: book.stock > 0 ? "#EDE7F6" : "#FFEBEE",
                border: `1px solid ${book.stock > 0
                  ? "#D1C4E9" : "#FFCDD2"}`,
              }}>
                <Inventory2 fontSize="small"
                  sx={{
                    color: book.stock > 0
                      ? "#534AB7" : "#E24B4A"
                  }} />
                <Typography variant="caption"
                  color="text.secondary"
                  display="block" mt={0.5}>
                  Stock
                </Typography>
                <Typography variant="h6" fontWeight="800"
                  color={book.stock > 0
                    ? "#534AB7" : "#E24B4A"}>
                  {book.stock}
                </Typography>
              </Paper>
            </Box>
          </Box>

          {/* ── RIGHT: Details ── */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              maxWidth: 700, 
            }}
          >
            <Paper elevation={0} sx={{
              borderRadius: 3, p: { xs: 3, md: 4 },
              border: "1px solid #e8e8e8",
              bgcolor: "#fff",
            }}>

              {/* Genre + ISBN */}
              <Stack direction="row" spacing={1.5}
                alignItems="center" mb={2.5}>
                <Chip
                  label={book.genre}
                  color="primary"
                  size="medium"
                  icon={<MenuBook style={{ fontSize: 14 }} />}
                />
                <Typography variant="caption"
                  color="text.secondary"
                  sx={{
                    bgcolor: "#f5f5f5", px: 1.5,
                    py: 0.5, borderRadius: 1,
                    fontFamily: "monospace",
                  }}>
                  ISBN: {book.isbn}
                </Typography>
              </Stack>

              {/* Title */}
              <Typography variant="h4" fontWeight="800"
                color="#1a1a2e"
                sx={{ lineHeight: 1.2, mb: 1.5 }}>
                {book.title}
              </Typography>

              {/* Author */}
              <Typography variant="h6"
                color="text.secondary"
                fontWeight="400" mb={3}>
                by{" "}
                <strong style={{ color: "#1a1a2e" }}>
                  {book.author}
                </strong>
              </Typography>

              <Divider sx={{ mb: 3 }} />

              {/* Description */}
              <Typography variant="body1"
                color="text.secondary"
                sx={{
                  lineHeight: 1.9, mb: 4,
                  fontSize: "15px"
                }}>
                {book.description ||
                  "No description available for this book."}
              </Typography>

              <Divider sx={{ mb: 3 }} />

              {/* Price + stock chip */}
              <Box sx={{
                display: "flex", alignItems: "center",
                gap: 2.5, mb: 4,
              }}>
                <Typography variant="h3"
                  color="success.main" fontWeight="800">
                  {formatKES(book.price)}
                </Typography>
                <Chip
                  label={book.stock > 0
                    ? `✓ In Stock (${book.stock} available)`
                    : "✗ Out of Stock"}
                  color={book.stock > 0 ? "success" : "error"}
                  variant="outlined"
                  sx={{
                    fontWeight: 600, px: 1,
                    fontSize: "13px"
                  }}
                />
              </Box>

              {/* Action buttons */}
              <Stack direction={{ xs: "column", sm: "row" }}
                spacing={2} mb={4}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<ShoppingCart />}
                  disabled={book.stock === 0}
                  onClick={() => {
                    dispatch(addToCart(book))
                    toast.success(
                      `"${book.title}" added to cart!`)
                  }}
                  sx={{
                    borderRadius: 2, py: 1.5,
                    fontSize: "15px", fontWeight: 700,
                  }}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<Store />}
                  disabled={book.stock === 0}
                  onClick={() => {
                    dispatch(addToCart(book))
                    navigate("/cart")
                  }}
                  sx={{
                    borderRadius: 2, py: 1.5,
                    fontSize: "15px", fontWeight: 700,
                    borderWidth: 2,
                    "&:hover": { borderWidth: 2 },
                  }}
                >
                  Buy Now
                </Button>
              </Stack>

              {/* Book details table */}
              <Paper variant="outlined" sx={{
                borderRadius: 2, overflow: "hidden",
              }}>
                <Box sx={{
                  bgcolor: "#f5f5f5",
                  px: 2.5, py: 1.5,
                  borderBottom: "1px solid #eee",
                }}>
                  <Typography variant="body2"
                    fontWeight="700"
                    color="text.secondary"
                    letterSpacing={1}>
                    BOOK DETAILS
                  </Typography>
                </Box>
                {[
                  {
                    label: "Author",
                    value: book.author
                  },
                  {
                    label: "Genre",
                    value: book.genre
                  },
                  {
                    label: "ISBN",
                    value: book.isbn
                  },
                  {
                    label: "Price",
                    value: formatKES(book.price)
                  },
                  {
                    label: "Availability",
                    value: book.stock > 0
                      ? `In Stock (${book.stock} copies)`
                      : "Out of Stock"
                  },
                ].map(({ label, value }, i) => (
                  <Box key={label} sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 2.5, py: 1.8,
                    bgcolor: i % 2 === 0 ? "#fff" : "#fafafa",
                    borderBottom: "1px solid #f0f0f0",
                  }}>
                    <Typography variant="body2"
                      color="text.secondary"
                      fontWeight={500}
                      sx={{ width: 140, flexShrink: 0 }}>
                      {label}
                    </Typography>
                    <Typography variant="body2"
                      fontWeight="600" color="#1a1a2e">
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Paper>

            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default BookDetailPage