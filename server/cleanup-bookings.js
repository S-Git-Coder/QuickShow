// Cleanup script to delete ALL bookings
import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import 'dotenv/config';

const cleanupBookings = async () => {
    try {
        // Connect to database
        await mongoose.connect(`${process.env.MONGODB_URI}/quickshow`);
        console.log('Connected to database:', `${process.env.MONGODB_URI}/quickshow`);

        // Count all bookings first
        const totalCount = await Booking.countDocuments();
        console.log(`Total bookings before cleanup: ${totalCount}`);

        // Delete ALL bookings
        const result = await Booking.deleteMany({});

        console.log(`Deleted ALL ${result.deletedCount} booking records`);

        // Verify cleanup
        const remainingCount = await Booking.countDocuments();
        console.log(`Remaining bookings: ${remainingCount}`);

        await mongoose.disconnect();
        console.log('Cleanup completed successfully');

    } catch (error) {
        console.error('Cleanup error:', error);
    }
};

cleanupBookings();