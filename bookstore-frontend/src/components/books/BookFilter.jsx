import {
  Box, Chip, Typography, Divider, Slider, Stack, Paper
} from "@mui/material"
import { FilterList } from "@mui/icons-material"

const genres = [
  "All", "Programming", "Psychology","Biography","Fiction","Nonfiction", "Classic",
  "Self-help", "Finance", "Business","Memoir","Poetry","Computer Science", "Database", "Fantasy",
]

const BookFilter = ({ selectedGenre, onGenreChange,
  priceRange, onPriceChange }) => {

  return (
    <Paper elevation={2} sx={{
      borderRadius: 3,
      p: 2.5,
      position: "sticky",
      top: 80,
      bgcolor: "#fff",
    }}>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <FilterList color="primary" fontSize="small" />
        <Typography variant="subtitle1" fontWeight="bold">
          Filters
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Genre Label */}
      <Typography variant="caption" fontWeight="700"
        color="text.secondary" letterSpacing={1}
        sx={{ mb: 1.5, display: "block" }}>
        GENRE
      </Typography>

      {/* Genre vertical list */}
      <Stack spacing={0.8}>
        {genres.map((genre) => {
          const isActive = selectedGenre === genre ||
            (genre === "All" && (!selectedGenre || selectedGenre === "All"))
          return (
            <Box
              key={genre}
              onClick={() => onGenreChange(genre)}
              sx={{
                px: 1.5,
                py: 0.8,
                borderRadius: 2,
                cursor: "pointer",
                fontWeight: isActive ? 600 : 400,
                fontSize: "16px",
                color: isActive ? "#fff" : "#555",
                bgcolor: isActive ? "primary.main" : "transparent",
                border: isActive
                  ? "1px solid transparent"
                  : "1px solid #e0e0e0",
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: isActive ? "primary.dark" : "#f0f0f0",
                },
              }}
            >
              {genre}
            </Box>
          )
        })}
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Price Range */}
      {priceRange && onPriceChange && (
        <>
          <Typography variant="caption" fontWeight="700"
            color="text.secondary" letterSpacing={1}
            sx={{ mb: 1.5, display: "block" }}>
            PRICE RANGE
          </Typography>
          <Box sx={{ px: 0.5 }}>
            <Slider
              value={priceRange}
              onChange={(_, val) => onPriceChange(val)}
              valueLabelDisplay="auto"
              min={0}
              max={2000}
              step={50}
              valueLabelFormat={(val) => `KSH${val}`}
              color="primary"
            />
            <Box sx={{ display: "flex",
              justifyContent: "space-between", mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                KSH{priceRange[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                KSH{priceRange[1]}
              </Typography>
            </Box>
          </Box>
        </>
      )}

    </Paper>
  )
}

export default BookFilter