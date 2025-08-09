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
        referenceId: { type: String },
        paymentMode: { type: String },
        txMsg: { type: String },
        txTime: { type: String },
        signature: { type: String }
    }
}, { timestamps: true })

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;