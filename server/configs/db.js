import mongoose, { mongo } from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', ()=> {
            if (process.env.NODE_ENV !== 'production') {
                console.log('Database connected');
            }
        });
        await mongoose.connect(`${process.env.MONGODB_URI}/quickshow`)
    } catch (error) {
        // Handle database connection error
        if (process.env.NODE_ENV !== 'production') {
            console.log(error.message);
        }
    }
}

export default connectDB;