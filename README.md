# SNEAKLAB — Premium Sneakers & Streetwear (Full MERN Stack)

Fashion D2C storefront · **React.js (Vite) + Tailwind** · **Node.js + Express + MongoDB (Mongoose)** · JWT auth · Razorpay (with mock mode) · Admin Panel · End-to-End transaction · Premium Luxury UI · Mobile-First Responsive

Flow: Browse → Product → Cart → Checkout (Address + Coupon) → Payment (Razorpay/COD) → MongoDB Order → Admin (status/refund) → Orders/Tracking

---

## Structure

```
sneaklab/
├─ backend/
│  ├─ server.js                  # Express app, routes, error handling
│  ├─ .env                       # already configured for zero-setup memory DB
│  └─ src/
│     ├─ config/db.js            # real Mongo OR in-memory fallback
│     ├─ middleware/auth.js      # JWT protect + adminOnly
│     ├─ models/  User · Product · Order · Coupon
│     ├─ routes/  auth · products · orders · payments · coupons · admin
│     ├─ seed/seed.js            # demo catalog + admin + coupons (auto-seeds)
│     └─ utils/pricing.js        # server-authoritative totals
└─ frontend/
   └─ src/
      ├─ api/client.js           # fetch wrapper + JWT storage
      ├─ context/ AuthContext · CartContext
      ├─ components/ Navbar · Hero · ProductCard · Footer
      ├─ pages/ Home · Product · Cart · Checkout · Login · Orders · Admin
      ├─ data/useProducts.js     # shared catalog fetcher
      └─ utils/format.js         # rupees / discount helpers
```

## Run (2 terminals)

```bash
# 1) Backend → http://localhost:5000
cd backend
npm install
npm run dev        # starts MongoDB in-memory automatically if MONGO_URI is "memory://"
                   # real Mongo: set MONGO_URI=mongodb://localhost:27017/sneaklab (or Atlas)

# 2) Frontend → http://localhost:5173  (dev proxy forwards /api → :5000)
cd frontend
npm install
npm run dev
```

First backend start auto-seeds: 8 products, admin account, coupons.
`npm run seed` re-seeds a real DB manually.

## Demo accounts

| Role  | Email               | Password |
| ----- | ------------------- | -------- |
| Admin | admin@sneaklab.com  | Admin@123 |
| User  | register any email  | 6+ chars  |

## Payments — Razorpay E2E

- **No keys in .env** → MOCK mode: `POST /api/payments/mock/success/:id` completes UPI orders locally (fully testable E2E).
- **Keys set** → real flow: `/api/payments/razorpay/create` → Razorpay Checkout.js popup → `/api/payments/razorpay/verify` (HMAC signature check) → order marked Paid.
- COD supported: order placed with payment status `Pending`.

## API summary

- `POST /api/auth/register|login` · `GET /api/auth/me`
- `GET /api/products` (`?category&search&bestseller&sort`) · `GET /api/products/:id`
- `POST /api/orders` · `GET /api/orders/mine` · `GET /api/orders/:id`
- `POST /api/coupons/validate`
- `POST /api/payments/razorpay/create|verify` · `POST /api/payments/mock/success/:orderId`
- Admin (JWT): `GET /api/admin/stats` · `GET /api/admin/orders` · `PUT /api/admin/orders/:id/status|refund` · `GET|POST /api/admin/products` (+PUT/DELETE) · `GET|POST /api/admin/coupons`

## Design system

- Colors: `ink #0A0A0A` · `bone #F5F1EA` · `rust #C2502A` · `sand #E7E0D5`
- Fonts: Fraunces (display serif) + Manrope (sans)
- Note: totals, stock decrements, coupons and refunds are computed **server-side** — the cart in localStorage only holds product ids + quantities.

Deploy: frontend → Vercel · backend → Render/Railway · database → MongoDB Atlas.
