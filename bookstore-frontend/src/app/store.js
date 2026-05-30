import { configureStore } from "@reduxjs/toolkit"
import authReducer    from "../features/auth/authSlice"
import bookReducer    from "../features/books/bookSlice"
import cartReducer    from "../features/cart/cartSlice"
import orderReducer   from "../features/orders/orderSlice"
import paymentReducer from "../features/payment/paymentSlice"
import licenseReducer from "../features/license/licenseSlice"
import mpesaReducer   from "../features/mpesa/mpesaSlice"

export const store = configureStore({
  reducer: {
    auth:    authReducer,
    books:   bookReducer,
    cart:    cartReducer,
    orders:  orderReducer,
    payment: paymentReducer,
    license: licenseReducer,
    mpesa:   mpesaReducer,
  },
})
