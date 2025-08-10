import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';

// Set default NODE_ENV if not defined
// process.env.NODE_ENV = process.env.NODE_ENV || 'development'; // Commented out to use value from .env
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import testRouter from './routes/testRoutes.js';

const app = express();
const port = 3000;

// Connect to database with error handling
let dbConnected = false;

// Attempt to connect to the database
const initializeDatabase = async () => {
  try {
    await connectDB();
    dbConnected = true;
    console.log('Database initialization successful');
  } catch (error) {
    console.error('Failed to initialize database:', error.message);
    dbConnected = false;
    // Don't exit the process, let the app continue with degraded functionality
  }
};

// Initialize database connection
initializeDatabase();

// Middleware
app.use(express.json())

// Configure CORS with specific options for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    // Define allowed origins
    const allowedOrigins = [
      // Development origins (commented out for production)
      // 'http://localhost:5173',
      // 'http://localhost:5174',
      // 'http://localhost:3000',
      // Production origin
      'https://quickshow-pied.vercel.app'
    ];

    // In production, only allow specific origins
    // In development, allow localhost with any port
    const isProduction = process.env.NODE_ENV === 'production' || process.env.CASHFREE_USE_PRODUCTION === 'true';
    
    if (isProduction) {
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    } else if (allowedOrigins.includes(origin) || origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }

    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions))

// Configure Clerk middleware
app.use(clerkMiddleware());

// API Routes 
app.get('/', (req, res) => res.send('Server is Live!'))
app.use('/api/inngest', serve({ client: inngest, functions }))
app.use('/api/show', showRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)
app.use('/api/test', testRouter)

app.listen(port, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server listening at http://localhost:${port}`);
  }
});