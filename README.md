# Smart Bookstore Management System

> **Powered by PhinTech Solutions — Built in Kenya 🇰🇪**  
> https://phintechsolutions.com

A full-stack bookstore management system with M-Pesa payments, licensing, and admin management — built for the Kenyan market.

---

## Features

### Customer
- Browse, search, and filter books by genre, author, title
- Shopping cart with localStorage persistence
- Checkout via **M-Pesa STK Push** (Lipia Online) or **Stripe card**
- Order tracking with real-time status updates
- Email notifications (order confirmation, status updates)
- 14-day free trial with upgrade prompts

### Admin
- Full book inventory management (CRUD)
- Order management with status updates
- Revenue dashboard with KES totals
- Email log viewer
- License management

### Licensing & Monetization
| Plan | Price (KES) | Duration |
|------|-------------|----------|
| Free Trial | 0 | 14 days |
| Monthly | 2,000 | 30 days |
| Annual | 23,000 | 365 days |
| Lifetime | 25,000 | Forever |

---

## Tech Stack

**Backend:** Node.js · Express 5 · MongoDB · Mongoose · JWT · Nodemailer  
**Frontend:** React 19 · Vite 8 · Redux Toolkit · MUI v9 · React Router v7  
**Payments:** M-Pesa via Lipia Online · Stripe (card)  
**Deployment:** Vercel (frontend + backend) · MongoDB Atlas

---

## Quick Start

### Backend
```bash
cd bookstore-backend
cp .env.example .env
# Fill in your env vars (see DEPLOYMENT.md)
npm install
npm run dev
```

### Frontend
```bash
cd bookstore-frontend
cp .env.example .env
# Fill in your env vars
npm install
npm run dev
```

---

## Environment Variables

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete setup guide including:
- All required environment variables
- Vercel deployment steps
- Lipia Online M-Pesa configuration
- Stripe webhook setup
- MongoDB Atlas setup
- Security recommendations

---

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/profile` | Private | Get profile |
| GET | `/api/books` | Public | List books |
| POST | `/api/books` | Admin | Create book |
| PUT | `/api/books/:id` | Admin | Update book |
| DELETE | `/api/books/:id` | Admin | Delete book |
| POST | `/api/orders` | Private | Create order |
| GET | `/api/orders/my` | Private | My orders |
| GET | `/api/orders` | Admin | All orders |
| PUT | `/api/orders/:id/status` | Admin | Update status |
| POST | `/api/mpesa/pay-order` | Private | M-Pesa order payment |
| POST | `/api/mpesa/pay-license` | Private | M-Pesa license payment |
| GET | `/api/mpesa/status/:ref` | Private | Check payment status |
| POST | `/api/mpesa/callback` | Public | Lipia Online webhook |
| GET | `/api/mpesa/history` | Private | Payment history |
| GET | `/api/license/status` | Private | License status |
| GET | `/api/license/pricing` | Public | Pricing plans |
| POST | `/api/payment/create-intent` | Private | Stripe intent |
| POST | `/api/payment/webhook` | Public | Stripe webhook |

---

## Currency

All prices are in **KES (Kenyan Shillings)**.  
M-Pesa payments via **Lipia Online** — Till Number: PHINTECHSOLUTIONS  
Payment link: https://lipia-online.vercel.app/link/PHINTECHSOLUTIONS

---

## License

This project is proprietary software.  
Developed and maintained by **PhinTech Solutions**.

---

*Powered by PhinTech Solutions — Built in Kenya 🇰🇪*  
*https://phintechsolutions.com*
