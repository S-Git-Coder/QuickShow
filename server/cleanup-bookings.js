// Cleanup script to delete ALL bookings
import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import 'dotenv/config';

const cleanupBookings = async () => {
    try {
        // Connect to database
        await mongoose.connect(`${process.env.MONGODB_URI}/quickshow`);

        // Count all bookings first
        const totalCount = await Booking.countDocuments();

        // Delete ALL bookings
        const result = await Booking.deleteMany({});

        // Verify cleanup
        const remainingCount = await Booking.countDocuments();

        await mongoose.disconnect();

    } catch (error) {
        console.error('Cleanup error:', error);
    }
};

cleanupBookings();