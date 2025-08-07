import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import User from "../models/User.js";


export const syncUser = async (req, res) => {
    try {
        const { userId, name, email, image, phone } = req.body;
        let user = await User.findById(userId);
        if (!user) {
            user = await User.create({ _id: userId, name, email, image, phone });
        } else {
            // Update user data including phone if it exists
            user.name = name;
            user.email = email;
            user.image = image;
            if (phone) {
                user.phone = phone;
            }
            await user.save();
        }
        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


// API Controller Function to Get User Bookings
export const getUserBookings = async (req, res) => {
    console.log('getUserBookings API called');
    try {
        console.log('Request headers:', req.headers);
        console.log('Auth object available:', !!req.auth);
        
        // Check if auth function exists and can be called
        if (!req.auth || typeof req.auth !== 'function') {
            console.error('Auth function not available or not a function');
            return res.status(401).json({success: false, message: 'Authentication error: auth function not available'});
        }
        
        // Get user ID from auth
        const userId = req.auth().userId;
        console.log('Authenticated user ID:', userId);
        
        if (!userId) {
            console.error('No user ID found in auth object');
            return res.status(401).json({success: false, message: 'Authentication error: No user ID'});
        }
        
        console.log('Fetching bookings for user:', userId);
        const bookings = await Booking.find({user: userId}).populate({
            path: "show",
            populate: {path: "movie"}
        }).sort({createdAt: -1});
        
        console.log('Bookings found:', bookings.length);
        
        // Debug each booking
        bookings.forEach((booking, index) => {
            console.log(`Booking ${index + 1}:`, {
                id: booking._id,
                isPaid: booking.isPaid,
                paymentStatus: booking.paymentStatus,
                paymentLink: booking.paymentLink ? 'Present' : 'Missing',
                show: booking.show ? booking.show._id : 'Missing',
                movie: booking.show && booking.show.movie ? booking.show.movie.title : 'Missing'
            });
        });
        
        // Ensure paymentLink is included in the response
        const bookingsWithPaymentLinks = bookings.map(booking => {
            const bookingObj = booking.toObject();
            console.log(`Processing booking ${booking._id}, paymentLink:`, booking.paymentLink ? 'Present' : 'Missing');
            return {
                ...bookingObj,
                paymentLink: booking.paymentLink // Explicitly include paymentLink
            };
        });
        
        console.log('Sending response with bookings');
        res.json({success: true, bookings: bookingsWithPaymentLinks});
    } catch (error) {
        console.error('Error in getUserBookings:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({success: false, message: error.message});
    }
}

// API Controller Function to Update Favorite Movie in Clerk User Metadata
export const updateFavorite = async (req, res) => {
    try {
        const {movieId} = req.body;
        const userId = req.auth().userId;

        const user = await clerkClient.users.getUser(userId);

        if(!user.privateMetadata.favorites){
            user.privateMetadata.favorites = [];
        }

        if(!user.privateMetadata.favorites.includes(movieId)){
            user.privateMetadata.favorites.push(movieId)
        }else{
            user.privateMetadata.favorites = user.privateMetadata.favorites.filter(item => item !== movieId)
        }

        await clerkClient.users.updateUserMetadata(userId, {privateMetadata: user.privateMetadata})

        res.json({success: true, message: "Favorite movies updated"})
    } catch (error) {
        console.error(error.message);
        res.json({success: false, message: error.message});
    }
}

export const getFavorites = async (req, res) => {
    try {
        const user = await clerkClient.users.getUser(req.auth().userId)
        const favorites = user.privateMetadata.favorites;

        // Getting movies from database
        const movies = await Movie.find({_id: {$in: favorites}})

        res.json({success: true, movies});
    } catch (error) {
        console.error(error.message);
        res.json({success: false, message: error.message});
    }
}