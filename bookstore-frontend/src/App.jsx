import { useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchLicenseStatus } from "./features/license/licenseSlice"

import Navbar         from "./components/common/Navbar"
import Footer         from "./components/common/Footer"
import TrialBanner    from "./components/license/TrialBanner"
import ProtectedRoute from "./components/common/ProtectedRoute"
import AdminRoute     from "./components/common/AdminRoute"

import LoginPage       from "./pages/auth/LoginPage"
import RegisterPage    from "./pages/auth/RegisterPage"
import ProfilePage     from "./pages/auth/ProfilePage"
import BooksListPage   from "./pages/books/BooksListPage"
import BookDetailPage  from "./pages/books/BookDetailPage"
import CartPage        from "./pages/cart/CartPage"
import CheckoutPage    from "./pages/payment/CheckoutPage"
import MyOrdersPage    from "./pages/orders/MyOrdersPage"
import OrderDetailPage from "./pages/orders/OrderDetailPage"
import OrderSuccessPage from "./pages/orders/OrderSuccessPage"
import AdminDashboard  from "./pages/admin/AdminDashboard"
import AdminBooksPage  from "./pages/admin/AdminBooksPage"
import AdminOrdersPage from "./pages/admin/AdminOrdersPage"
import LicensePage     from "./pages/license/LicensePage"

function App() {
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)

  // Fetch license status whenever user is logged in
  useEffect(() => {
    if (token) dispatch(fetchLicenseStatus())
  }, [token, dispatch])

  return (
    <div style={{
      minHeight:       "100vh",
      display:         "flex",
      flexDirection:   "column",
      width:           "100%",
      backgroundColor: "#f0f2f5",
    }}>
      <Navbar />
      <TrialBanner />

      <main style={{ flex: 1, width: "100%" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/books" />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/books"     element={<BooksListPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />

          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          <Route path="/cart" element={
            <ProtectedRoute><CartPage /></ProtectedRoute>} />

          <Route path="/checkout" element={
            <ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

          <Route path="/orders" element={
            <ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />

          <Route path="/orders/:id" element={
            <ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />

          <Route path="/order-success" element={
            <ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />

          <Route path="/license" element={
            <ProtectedRoute><LicensePage /></ProtectedRoute>} />

          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>} />

          <Route path="/admin/books" element={
            <AdminRoute><AdminBooksPage /></AdminRoute>} />

          <Route path="/admin/orders" element={
            <AdminRoute><AdminOrdersPage /></AdminRoute>} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
