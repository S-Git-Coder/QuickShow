import mongoose, { mongo } from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log('Database connected'); // Always show this for debugging
        });
        await mongoose.connect(`${process.env.MONGODB_URI}/quickshow`)
    } catch (error) {
        // Handle database connection error
        console.log('Database connection error:', error.message); // Always show errors
    }
}

export default connectDB;