import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: { type: String, required: true, ref: 'User' },
    show: { type: String, required: true, ref: 'Show' },
    amount: { type: Number, required: true },
    bookedSeats: { type: Array, required: true },
    isPaid: { type: Boolean, default: false },
    paymentLink: { type: String },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentDetails: {
        orderId: { type: String },
        referenceId: { type: String },
        paymentMode: { type: String },
        txMsg: { type: String },
        txTime: { type: String },
        signature: { type: String }
    }
}, { timestamps: true })

// Idempotency: prevent duplicate updates for the same orderId
bookingSchema.index({ 'paymentDetails.orderId': 1 }, { unique: true, sparse: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;