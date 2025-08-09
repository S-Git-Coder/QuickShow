import express from 'express';
import { createBooking, getOccupiedSeats, handlePaymentCallback, handlePaymentWebhook, verifyPayment, verifyBookingPayment } from '../controllers/bookingController.js';

const bookingRouter = express.Router();

bookingRouter.post('/create', createBooking);
bookingRouter.get('/seats/:showId', getOccupiedSeats);
bookingRouter.get('/callback', handlePaymentCallback);
bookingRouter.post('/webhook', handlePaymentWebhook);
bookingRouter.get('/verify/:orderId', verifyPayment);
bookingRouter.get('/verify-booking/:bookingId', verifyBookingPayment);

export default bookingRouter;