import mongoose from "mongoose";

// Global connection state tracking
let isConnected = false;

const connectDB = async () => {
    // If already connected, reuse the connection
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    try {
        // Set connection options with proper timeouts
        const options = {
            serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
            socketTimeoutMS: 45000,         // Socket timeout
            connectTimeoutMS: 30000,        // Connection timeout
            maxPoolSize: 10,                // Maintain up to 10 socket connections
            minPoolSize: 5,                 // Maintain at least 5 socket connections
            maxIdleTimeMS: 60000,           // Close sockets after 60 seconds of inactivity
            family: 4                        // Use IPv4, skip trying IPv6
        };

        // Set up connection event listeners before connecting
        mongoose.connection.on('connected', () => {
            isConnected = true;
            console.log('Database connected');
        });

        mongoose.connection.on('error', (err) => {
            isConnected = false;
            console.log('MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            isConnected = false;
            console.log('MongoDB disconnected');
        });

        // Connect to MongoDB
        await mongoose.connect(`${process.env.MONGODB_URI}/quickshow`, options);
    } catch (error) {
        isConnected = false;
        console.log('Database connection error:', error.message);
        // Throw the error to be handled by the caller
        throw error;
    }
}

export default connectDB;