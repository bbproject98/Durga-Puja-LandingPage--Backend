# 🪔 BroomBoom Cabs — Backend API (Express + Prisma)

Backend API service for **BroomBoom Cabs Kolkata Durga Puja & Outstation Chauffeur Rentals**.

---

## 📁 Directory Structure

```
broomboom-backend/
├── prisma/
│   ├── schema.prisma         # Database schema (Lead, Fleet, Package, Booking models)
│   └── seed.js               # Database seed data (6 fleet cars & 12 packages)
├── src/
│   ├── config/
│   │   ├── db.js             # Singleton PrismaClient connection
│   │   └── env.js            # Environment variable validation
│   ├── middlewares/
│   │   ├── errorHandler.js   # Centralized JSON error handler
│   │   └── validateRequest.js# Request payload validation middleware
│   ├── routes/
│   │   ├── fleetRoutes.js    # GET /api/fleet, GET /api/fleet/:id
│   │   ├── packageRoutes.js  # GET /api/packages, /api/packages/:id
│   │   ├── leadRoutes.js     # POST /api/leads, GET /api/leads
│   │   └── bookingRoutes.js  # POST /api/bookings, GET /api/bookings/:id
│   ├── controllers/
│   │   ├── fleetController.js
│   │   ├── packageController.js
│   │   ├── leadController.js
│   │   └── bookingController.js
│   ├── services/
│   │   ├── fleetService.js
│   │   ├── packageService.js
│   │   ├── leadService.js
│   │   └── bookingService.js # Calculates 20% advance & generates BBC-PUJA-XXXXXX IDs
│   └── server.js             # Express app entry point
├── package.json
└── .env
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```powershell
cd broomboom-backend
npm install
```

### 2. Generate Prisma Client & Push Database Schema
```powershell
npx prisma generate
npx prisma db push
```

### 3. Seed Initial Fleet & Packages Data
```powershell
node prisma/seed.js
```

### 4. Start the Backend Server
```powershell
# Development (with nodemon auto-restart)
npm run dev

# Production
npm start
```

The backend server will run on **`http://localhost:5000`**.

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health and database connection status |
| `POST` | `/api/leads` | Capture lead details from Login / Quick Access popup |
| `GET` | `/api/leads` | Retrieve all submitted leads |
| `GET` | `/api/fleet` | Get all vehicles (optional `?category=sedan\|suv\|traveller`) |
| `GET` | `/api/fleet/:id` | Get single vehicle details with Inclusions & Exclusions |
| `GET` | `/api/packages` | Get all packages (optional `?type=rental\|outstation`) |
| `GET` | `/api/packages/:id` | Get package details by ID |
| `POST` | `/api/bookings` | Confirm booking, calculate 20% advance & generate reference slip |
| `GET` | `/api/bookings/:id` | Get booking slip by Reference ID (e.g. `BBC-PUJA-849201`) |
| `GET` | `/api/bookings` | List all confirmed bookings |

---

## 🔗 Frontend Connection
The Next.js frontend connects directly to this backend using `lib/api.ts`.
Configure `NEXT_PUBLIC_API_URL=http://localhost:5000` in the frontend root `.env.local` if custom hosting is required.

