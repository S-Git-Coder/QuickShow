import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import User from "../models/User.js";


export const syncUser = async (req, res) => {
    try {
        const { userId, name, email, image, phone } = req.body;
        
        // Set timeout for database operations
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database operation timed out')), 5000);
        });
        
        // Find user with timeout protection
        let user;
        try {
            user = await Promise.race([
                User.findById(userId),
                timeoutPromise
            ]);
        } catch (findError) {
            console.error('Error finding user:', findError.message);
            return res.json({ 
                success: false, 
                message: findError.message,
                userData: { userId, name, email } // Return the user data we received
            });
        }
        
        // If user doesn't exist, create a new one
        if (!user) {
            try {
                user = await Promise.race([
                    User.create({ _id: userId, name, email, image, phone }),
                    timeoutPromise
                ]);
            } catch (createError) {
                console.error('Error creating user:', createError.message);
                return res.json({ 
                    success: false, 
                    message: createError.message,
                    userData: { userId, name, email } // Return the user data we received
                });
            }
        } else {
            // Update user data including phone if it exists
            user.name = name;
            user.email = email;
            user.image = image;
            if (phone) {
                user.phone = phone;
            }
            
            try {
                await Promise.race([
                    user.save(),
                    timeoutPromise
                ]);
            } catch (saveError) {
                console.error('Error saving user:', saveError.message);
                return res.json({ 
                    success: false, 
                    message: saveError.message,
                    userData: { userId, name, email, image, phone } // Return the user data we received
                });
            }
        }
        
        res.json({ success: true, user });
    } catch (error) {
        console.error('Unexpected error in syncUser:', error.message);
        res.json({ 
            success: false, 
            message: error.message,
            userData: req.body // Return the user data we received
        });
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
            return res.status(401).json({ success: false, message: 'Authentication error: auth function not available' });
        }

        // Get user ID from auth
        const userId = req.auth().userId;
        console.log('Authenticated user ID:', userId);

        if (!userId) {
            console.error('No user ID found in auth object');
            return res.status(401).json({ success: false, message: 'Authentication error: No user ID' });
        }

        console.log('Fetching bookings for user:', userId);
        const bookings = await Booking.find({ user: userId }).populate({
            path: "show",
            populate: { path: "movie" }
        }).sort({ createdAt: -1 });

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

        // Ensure paymentLink is included in the response and regenerate missing links
        const bookingsWithPaymentLinks = await Promise.all(bookings.map(async booking => {
            const bookingObj = booking.toObject();
            console.log(`Processing booking ${booking._id}, paymentLink:`, booking.paymentLink ? 'Present' : 'Missing');

            // If payment link is missing and payment is not already completed, try to regenerate it
            if (!booking.paymentLink && booking.paymentStatus === 'pending' && !booking.isPaid) {
                try {
                    console.log(`Attempting to regenerate payment link for booking ${booking._id}`);

                    // Import necessary modules for Cashfree integration
                    const cashfreeConfig = (await import('../configs/cashfree.js')).default;
                    const { buildReturnUrl, buildNotifyUrl } = await import('../utils/urlBuilder.js');
                    const axios = (await import('axios')).default;

                    // Get user details for the order payload
                    const user = await User.findById(booking.user);

                    // Prepare order payload
                    const returnUrl = buildReturnUrl(`order_${booking._id}`);
                    const notifyUrl = buildNotifyUrl();

                    const orderPayload = {
                        order_id: `order_${booking._id}`,
                        order_amount: booking.amount,
                        order_currency: "INR",
                        customer_details: {
                            customer_id: booking.user,
                            customer_email: user?.email || 'user@example.com',
                            customer_phone: user?.phone || '9999999999'
                        },
                        order_meta: {
                            return_url: returnUrl,
                            notify_url: notifyUrl
                        }
                    };

                    // Set up headers for Cashfree API
                    const headers = {
                        "x-client-id": cashfreeConfig.appId,
                        "x-client-secret": cashfreeConfig.secretKey,
                        "x-api-version": "2023-08-01",
                        "Content-Type": "application/json"
                    };

                    // Make API call to Cashfree
                    const cashfreeRes = await axios.post(
                        `${cashfreeConfig.baseUrl}/orders`,
                        orderPayload,
                        { headers }
                    );

                    // Generate payment link from response
                    if (cashfreeRes.data.payment_session_id) {
                        // Always use production URL for payments
                        // const isProduction = process.env.NODE_ENV === 'production' || process.env.CASHFREE_USE_PRODUCTION === 'true';
                        // const basePaymentUrl = isProduction
                        //     ? 'https://payments.cashfree.com/pay/'
                        //     : 'https://sandbox.cashfree.com/pay/';
                        const basePaymentUrl = 'https://payments.cashfree.com/pay/';
                        const paymentLink = `${basePaymentUrl}${cashfreeRes.data.payment_session_id}`;

                        // Update booking with new payment link
                        booking.paymentLink = paymentLink;
                        await booking.save();

                        console.log(`Successfully regenerated payment link for booking ${booking._id}`);
                        bookingObj.paymentLink = paymentLink;
                    }
                } catch (error) {
                    console.error(`Failed to regenerate payment link for booking ${booking._id}:`, error.message);
                    // Continue with the existing (missing) payment link
                }
            }

            return {
                ...bookingObj,
                paymentLink: booking.paymentLink // Include the possibly regenerated payment link
            };
        }));

        console.log('Sending response with bookings');
        res.json({ success: true, bookings: bookingsWithPaymentLinks });
    } catch (error) {
        console.error('Error in getUserBookings:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API Controller Function to Update Favorite Movie in Clerk User Metadata
export const updateFavorite = async (req, res) => {
    try {
        const { movieId } = req.body;
        const userId = req.auth().userId;

        const user = await clerkClient.users.getUser(userId);

        if (!user.privateMetadata.favorites) {
            user.privateMetadata.favorites = [];
        }

        if (!user.privateMetadata.favorites.includes(movieId)) {
            user.privateMetadata.favorites.push(movieId)
        } else {
            user.privateMetadata.favorites = user.privateMetadata.favorites.filter(item => item !== movieId)
        }

        await clerkClient.users.updateUserMetadata(userId, { privateMetadata: user.privateMetadata })

        res.json({ success: true, message: "Favorite movies updated" })
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const getFavorites = async (req, res) => {
    try {
        const user = await clerkClient.users.getUser(req.auth().userId)
        const favorites = user.privateMetadata.favorites;

        // Getting movies from database
        const movies = await Movie.find({ _id: { $in: favorites } })

        res.json({ success: true, movies });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}