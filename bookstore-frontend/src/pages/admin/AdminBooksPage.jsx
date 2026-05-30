import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { fetchBooks, createBook, updateBook, deleteBook } from "../../features/books/bookSlice"
import { formatKES } from "../../utils/formatPrice"
import {
  Box, Typography, Button, Paper,
  TextField, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions,
  Grid, Chip, CircularProgress, InputAdornment
} from "@mui/material"
import { Add, Edit, Delete, Search } from "@mui/icons-material"

const schema = yup.object({
  title:       yup.string().required("Title is required"),
  author:      yup.string().required("Author is required"),
  genre:       yup.string().required("Genre is required"),
  price:       yup.number().positive().required("Price is required"),
  stock:       yup.number().min(0).required("Stock is required"),
  isbn:        yup.string().required("ISBN is required"),
  description: yup.string(),
  imageUrl:    yup.string().url("Must be a valid URL").nullable(),
})

const AdminBooksPage = () => {
  const dispatch = useDispatch()
  const { books, isLoading } = useSelector((state) => state.books)

  const [open, setOpen]               = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [search, setSearch]           = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    dispatch(fetchBooks({ limit: 100 }))
  }, [dispatch])

  const handleOpen = (book = null) => {
    setEditingBook(book)
    reset(book || {})
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingBook(null)
    reset({})
  }

  const onSubmit = (data) => {
    if (editingBook) {
      dispatch(updateBook({ id: editingBook._id, data }))
    } else {
      dispatch(createBook(data))
    }
    handleClose()
  }

  const handleDelete = (id) => {
    dispatch(deleteBook(id))
    setDeleteConfirm(null)
  }

  const filtered = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box sx={{ bgcolor: "#f0f2f5", minHeight: "100vh", width: "100%" }}>

      {/* ── Header ── */}
      <Box sx={{
        bgcolor: "#fff", borderBottom: "1px solid #e8e8e8",
        px: { xs: 2, md: 6 }, py: 2.5,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Box>
          <Typography variant="h5" fontWeight="800" color="#1a1a2e">Manage Books</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {books.length} books in inventory
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}
          sx={{ borderRadius: 2, fontWeight: 600, px: 3 }}>
          Add Book
        </Button>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ px: { xs: 2, md: 6 }, py: 4 }}>
        <TextField
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="medium"
          sx={{ mb: 3, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
            ),
            sx: { borderRadius: 2, bgcolor: "#fff" },
          }}
        />

        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e8e8e8", overflow: "hidden" }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#fafafa" }}>
                  {["Book", "Genre", "Price (KES)", "Stock", "Actions"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: "700", color: "text.secondary", fontSize: "12px", letterSpacing: 0.5 }}>
                      {h.toUpperCase()}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((book) => (
                  <TableRow key={book._id} sx={{ "&:hover": { bgcolor: "#f9f9f9" }, borderBottom: "1px solid #f5f5f5" }}>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <Box component="img"
                          src={book.imageUrl || "https://via.placeholder.com/45x60"}
                          alt={book.title}
                          sx={{ width: 45, height: 60, objectFit: "cover", borderRadius: 1.5, boxShadow: 1, flexShrink: 0 }}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight="700" color="#1a1a2e">{book.title}</Typography>
                          <Typography variant="caption" color="text.secondary">by {book.author}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={book.genre} size="medium" color="primary" variant="outlined"
                        sx={{ fontWeight: 600, fontSize: "11px" }} />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="700" color="success.main">
                        {formatKES(book.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={book.stock}
                        size="medium"
                        color={book.stock < 5 ? "error" : book.stock < 20 ? "warning" : "success"}
                        sx={{ fontWeight: 700, minWidth: 44 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton size="medium" onClick={() => handleOpen(book)}
                          sx={{ bgcolor: "#EDE7F6", color: "#534AB7", borderRadius: 1.5, "&:hover": { bgcolor: "#D1C4E9" } }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="medium" onClick={() => setDeleteConfirm(book._id)}
                          sx={{ bgcolor: "#FFEBEE", color: "#E24B4A", borderRadius: 1.5, "&:hover": { bgcolor: "#FFCDD2" } }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
                      No books found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Box>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: "800", pb: 1, borderBottom: "1px solid #f0f0f0" }}>
          {editingBook ? "✏️ Edit Book" : "➕ Add New Book"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box component="form" id="book-form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Title *" fullWidth {...register("title")}
                  error={!!errors.title} helperText={errors.title?.message} size="medium" />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Author *" fullWidth {...register("author")}
                  error={!!errors.author} helperText={errors.author?.message} size="medium" />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Genre *" fullWidth {...register("genre")}
                  error={!!errors.genre} helperText={errors.genre?.message} size="medium" />
              </Grid>
              <Grid item xs={6}>
                <TextField label="ISBN *" fullWidth {...register("isbn")}
                  error={!!errors.isbn} helperText={errors.isbn?.message} size="medium" />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Price (KES) *" type="number" fullWidth {...register("price")}
                  error={!!errors.price} helperText={errors.price?.message} size="medium" />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Stock *" type="number" fullWidth {...register("stock")}
                  error={!!errors.stock} helperText={errors.stock?.message} size="medium" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Image URL" fullWidth {...register("imageUrl")}
                  error={!!errors.imageUrl}
                  helperText={errors.imageUrl?.message || "Paste a direct image link (https://...)"}
                  size="medium" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Description" fullWidth multiline rows={3} {...register("description")}
                  error={!!errors.description} helperText={errors.description?.message} size="medium" />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, borderTop: "1px solid #f0f0f0", gap: 1 }}>
          <Button onClick={handleClose} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button type="submit" form="book-form" variant="contained"
            sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}>
            {editingBook ? "Update Book" : "Create Book"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight="800">🗑️ Delete Book?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to delete this book? This action{" "}
            <strong>cannot be undone</strong> and will permanently remove it from inventory.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeleteConfirm(null)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => handleDelete(deleteConfirm)}
            sx={{ borderRadius: 2, fontWeight: 600 }}>
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminBooksPage
