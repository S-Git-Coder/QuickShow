import express from 'express';
import { createBooking, getOccupiedSeats, handlePaymentCallback, verifyPayment } from '../controllers/bookingController.js';

const bookingRouter = express.Router();

bookingRouter.post('/create', createBooking);
bookingRouter.get('/seats/:showId', getOccupiedSeats);
bookingRouter.post('/callback', handlePaymentCallback);
bookingRouter.get('/verify/:orderId', verifyPayment);

export default bookingRouter;