import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';

// Set default NODE_ENV if not defined
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const port = 3000;

await connectDB()

// Middleware
app.use(express.json())

// Configure CORS with specific options for debugging
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    // Define allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'https://quick-show.vercel.app'
    ];

    // Check if the origin is in the allowed list or is a localhost with any port
    if (allowedOrigins.includes(origin) || origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }

    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions))
console.log('CORS configured with options:', corsOptions);

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Request headers:', req.headers);
  next();
});

// Configure Clerk middleware with debug logging
app.use(clerkMiddleware());

// Add auth debug middleware
app.use((req, res, next) => {
  if (req.auth) {
    try {
      const authInfo = req.auth();
      console.log('Auth info available:', {
        userId: authInfo.userId,
        sessionId: authInfo.sessionId,
        isAuthenticated: !!authInfo.userId
      });
    } catch (error) {
      console.error('Error accessing auth info:', error.message);
    }
  } else {
    console.log('No auth object available on request');
  }
  next();
});

// API Routes 
app.get('/', (req, res) => res.send('Server is Live!'))
app.use('/api/inngest', serve({ client: inngest, functions }))
app.use('/api/show', showRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)

app.listen(port, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server listening at http://localhost:${port}`);
  }
});