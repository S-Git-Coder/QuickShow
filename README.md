
# QuickShow

QuickShow is a full-stack movie ticket booking platform with a modern React frontend and a Node.js/Express backend. It supports user authentication, movie browsing, seat selection, booking, payment integration, and an admin dashboard for managing shows and bookings.

## Table of Contents

- Features
- Tech Stack
- Project Structure
- Getting Started
- Deployment
- Emergency Fixes
- License

---

## Features

- User authentication (Clerk)
- Browse movies, view details, and watch trailers
- Select seats and book tickets
- Online payment integration (Cashfree)
- View and manage your bookings
- Admin dashboard for managing movies, shows, and bookings
- Responsive UI with Tailwind CSS

## Tech Stack

**Frontend:**
- React 19 + Vite
- React Router DOM
- Tailwind CSS
- Axios
- Clerk (authentication)
- Cashfree JS (payments)
- React Hot Toast, React Player

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Clerk Express (auth)
- Cashfree PG (payments)
- Nodemailer (emails)
- Cloudinary (media)
- Inngest (background jobs)
- Dotenv, CORS, UUID

## Project Structure

client/           # React frontend
  src/
    components/   # Reusable UI components
    pages/        # App pages (Home, Movies, MyBookings, Admin, etc.)
    context/      # React context for global state
    lib/          # Utility functions
server/           # Node.js backend
  controllers/    # Route controllers (admin, booking, user, etc.)
  models/         # Mongoose models (User, Movie, Booking, Show)
  routes/         # Express routes
  configs/        # Config files (db, nodemailer, cashfree)
  middleware/     # Auth middleware
  utils/          # Utility functions

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or cloud)
- Cashfree, Clerk, and Cloudinary credentials

### 1. Clone the repository

git clone https://github.com/S-Git-Coder/QuickShow.git
cd QuickShow

### 2. Setup the Client

cd client
npm install
npm run dev

### 3. Setup the Server

cd server
npm install
npm run dev

- Configure environment variables in .env (MongoDB URI, Clerk, Cashfree, etc.)

## Deployment

See DEPLOYMENT_FIX_GUIDE.md for detailed steps.

- Build frontend:
- 
  cd client
  npm run build
  # Deploy to Vercel or your hosting platform

- Deploy backend:  
  cd server

## Emergency Fixes

- See DEPLOYMENT_FIX_GUIDE.md for browser and database emergency fixes.
- Example: Clear local/session storage and reload bookings page if stuck.

## License

This project is licensed under the MIT License.
