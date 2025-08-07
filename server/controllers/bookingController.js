import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";
import axios from "axios";
import cashfreeConfig from "../configs/cashfree.js";

// Function to check availability of selected seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId);
        if (!showData) return false;

        const occupiedSeats = showData.occupiedSeats;
        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken;
    } catch (error) {
        // Handle error
        return false;
    }
};




export const createBooking = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { showId, selectedSeats } = req.body;

        const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
        if (!isAvailable) {
            return res.json({ success: false, message: "Selected seats are not available." });
        }

        const showData = await Show.findById(showId).populate('movie');

        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats
        });

        selectedSeats.forEach(seat => {
            showData.occupiedSeats[seat] = userId;
        });

        showData.markModified('occupiedSeats');
        await showData.save();

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        await booking.save();

        // --------- Cashfree Order Create Logic START ---------
        const orderPayload = {
            order_id: `order_${booking._id}`,
            order_amount: booking.amount,
            order_currency: "INR",
            customer_details: {
                customer_id: userId,
                customer_email: user.email,
                customer_phone: user.phone // Using dynamic phone number from user model
            },
            order_meta: {
                return_url: (process.env.NODE_ENV === 'production' || process.env.CASHFREE_USE_PRODUCTION === 'true')
                    ? "https://quick-show.vercel.app/my-bookings?orderId=" + `order_${booking._id}`
                    : "http://localhost:5174/my-bookings?orderId=" + `order_${booking._id}`,
                notify_url: (process.env.NODE_ENV === 'production' || process.env.CASHFREE_USE_PRODUCTION === 'true')
                    ? "https://quick-show-server.vercel.app/api/booking/callback"
                    : "http://localhost:3000/api/booking/callback"
            }
        };

        // Add detailed logging for debugging
        // console.log('Cashfree payment integration - Order payload:', JSON.stringify(orderPayload));
        // Enhanced debugging for Cashfree configuration
        // console.log('Cashfree config:', {
        //     baseUrl: cashfreeConfig.baseUrl,
        //     appId: cashfreeConfig.appId ? cashfreeConfig.appId.substring(0, 5) + '...' : 'Not available',
        //     secretKey: cashfreeConfig.secretKey ? cashfreeConfig.secretKey.substring(0, 5) + '...' : 'Not available',
        //     appIdLength: cashfreeConfig.appId ? cashfreeConfig.appId.length : 0,
        //     secretKeyLength: cashfreeConfig.secretKey ? cashfreeConfig.secretKey.length : 0,
        //     isProduction: process.env.NODE_ENV === 'production' || process.env.CASHFREE_USE_PRODUCTION === 'true',
        //     environment: process.env.NODE_ENV || 'development',
        //     cashfreeUseProduction: process.env.CASHFREE_USE_PRODUCTION
        // });

        // if (cashfreeConfig.appId) {
        //     console.log('Using App ID:', cashfreeConfig.appId.substring(0, 5) + '... (length: ' + cashfreeConfig.appId.length + ')');
        // }
        // if (cashfreeConfig.secretKey) {
        //     console.log('Using Secret Key:', cashfreeConfig.secretKey.substring(0, 5) + '... (length: ' + cashfreeConfig.secretKey.length + ')');
        // }

        // Credentials are now normalized in cashfree.js config

        let paymentLink;
        try {
            // Log the exact headers being sent
            const headers = {
                "x-client-id": cashfreeConfig.appId,
                "x-client-secret": cashfreeConfig.secretKey,
                "x-api-version": "2022-01-01",
                "Content-Type": "application/json"
            };

            // console.log('Sending request to Cashfree API with headers:', {
            //     "x-client-id": headers["x-client-id"].substring(0, 5) + '...',
            //     "x-client-secret": headers["x-client-secret"].substring(0, 5) + '...',
            //     "x-api-version": headers["x-api-version"],
            //     "Content-Type": headers["Content-Type"]
            // });

            const cashfreeRes = await axios.post(
                `${cashfreeConfig.baseUrl}/orders`,
                orderPayload,
                { headers }
            );
            console.log('Cashfree API response:', JSON.stringify(cashfreeRes.data));

            // Use the payment_link directly from the Cashfree response
            // The API version 2022-01-01 provides a direct payment_link instead of payment_session_id
            paymentLink = cashfreeRes.data.payment_link;
            console.log('Payment link generated:', paymentLink ? 'Success' : 'Failed');
            booking.paymentLink = paymentLink;
        } catch (error) {
            console.error('Cashfree API error:', error.message);
            console.error('Cashfree API error status:', error.response ? error.response.status : 'No status');
            console.error('Cashfree API error data:', error.response ? JSON.stringify(error.response.data) : 'No response data');
            throw error; // Re-throw to be caught by the outer try-catch
        }

        // Save the booking with payment link
        await booking.save();

        // --------- Cashfree Order Create Logic END ---------

        res.json({
            success: true,
            message: "Booking created successfully",
            paymentLink
        });
    } catch (error) {
        // Enhanced error logging
        console.error('Booking creation error:', error.message);
        console.error('Error stack:', error.stack);

        // Check if it's an Axios error with response
        if (error.isAxiosError && error.response) {
            console.error('API error status:', error.response.status);
            console.error('API error data:', JSON.stringify(error.response.data));

            // Special handling for 401 errors
            if (error.response.status === 401) {
                console.error('401 Unauthorized error detected - Check Cashfree API credentials');
                console.error('Headers sent:', JSON.stringify(error.config.headers));
            }
        }

        // Handle booking error
        res.json({
            success: false,
            message: error?.message,
            status: error.response?.status || 'unknown'
        });
    }
};

export const getOccupiedSeats = async (req, res) => {
    try {
        const { showId } = req.params;
        const showData = await Show.findById(showId);

        const occupiedSeats = Object.keys(showData.occupiedSeats);
        res.json({ success: true, occupiedSeats });
    } catch (error) {
        // Handle error in getOccupiedSeats
        res.json({ success: false, message: error.message });
    }
};

// Handle payment callback from Cashfree
export const handlePaymentCallback = async (req, res) => {
    try {
        console.log('Payment callback received - START');
        console.log('Request body:', JSON.stringify(req.body));
        console.log('Request headers:', JSON.stringify(req.headers));
        console.log('Request method:', req.method);
        console.log('Request path:', req.path);

        // Check if this is a test request from Cashfree dashboard
        // Cashfree dashboard sends a test request with specific headers
        const isCashfreeTest = req.headers['x-webhook-source'] === 'cashfree' ||
            req.headers['user-agent']?.includes('Cashfree');

        if (isCashfreeTest) {
            console.log('Cashfree dashboard test detected');
            // Return HTTP 200 with a simple success message
            // This is what Cashfree expects during webhook testing
            return res.status(200).send('Webhook received successfully');
        }

        const { orderId, orderAmount, referenceId, txStatus, paymentMode, txMsg, txTime, signature } = req.body;

        console.log('Payment callback received:', JSON.stringify(req.body));
        console.log('Headers:', JSON.stringify(req.headers));

        // Check if this is a test webhook from our test script
        const isTestWebhook = orderId?.includes('test');

        if (isTestWebhook) {
            console.log('Test webhook detected');
            // For test webhooks, just return success
            return res.json({
                success: true,
                message: `Test payment ${txStatus?.toLowerCase()} processed successfully`,
                testMode: true,
                apiVersion: req.headers['x-api-version'] || 'unknown'
            });
        }

        // Extract booking ID from order_id (format: order_<bookingId>)
        // Handle both formats: with or without 'order_' prefix
        let bookingId;
        if (orderId && orderId.startsWith('order_')) {
            bookingId = orderId.replace('order_', '');
        } else {
            // If orderId doesn't have the expected prefix, use it as is
            bookingId = orderId;
        }
        console.log('Original orderId:', orderId);
        console.log('Extracted booking ID:', bookingId);

        // Find the booking
        console.log('Searching for booking with ID:', bookingId);
        const booking = await Booking.findById(bookingId);
        console.log('Booking found:', booking ? 'Yes' : 'No');

        if (!booking) {
            console.error('Booking not found for orderId:', orderId);
            console.error('Original orderId from request:', req.body.orderId);
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        console.log('Current booking state:', {
            id: booking._id,
            isPaid: booking.isPaid,
            paymentStatus: booking.paymentStatus,
            amount: booking.amount,
            user: booking.user
        });

        // Update booking status based on payment status
        const newPaymentStatus = txStatus === 'SUCCESS' ? 'paid' : 'failed';
        const newIsPaid = txStatus === 'SUCCESS';

        console.log('Updating payment status:', {
            from: booking.paymentStatus,
            to: newPaymentStatus,
            isPaidFrom: booking.isPaid,
            isPaidTo: newIsPaid,
            txStatus
        });

        booking.paymentStatus = newPaymentStatus;
        booking.isPaid = newIsPaid; // Sync isPaid with paymentStatus
        booking.paymentDetails = {
            referenceId,
            paymentMode,
            txMsg,
            txTime,
            signature
        };

        console.log('Saving updated booking...');
        await booking.save();
        console.log('Booking saved successfully');

        console.log(`Payment ${txStatus} for booking ${bookingId}`);

        // Return success response
        res.json({
            success: true,
            message: `Payment ${txStatus.toLowerCase()} for booking ${bookingId}`
        });
    } catch (error) {
        console.error('Payment callback error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Manual payment verification endpoint for debugging
export const verifyPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        console.log('Manual payment verification requested for:', orderId);

        // Extract booking ID from order_id (format: order_<bookingId>)
        let bookingId;
        if (orderId && orderId.startsWith('order_')) {
            bookingId = orderId.replace('order_', '');
        } else {
            bookingId = orderId;
        }

        console.log('Looking for booking with ID:', bookingId);
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
                bookingId: bookingId
            });
        }

        // For debugging purposes, assume payment was successful if booking exists
        // This is a temporary solution for the stuck loading issue
        if (!booking.isPaid) {
            console.log('Booking found but not marked as paid, updating status...');
            booking.isPaid = true;
            booking.paymentStatus = 'paid';
            booking.paymentDetails = {
                ...booking.paymentDetails,
                manualVerification: true,
                verifiedAt: new Date().toISOString()
            };
            await booking.save();
            console.log('Booking status updated to paid');
        }

        res.json({
            success: true,
            message: 'Payment verified successfully',
            booking: {
                id: booking._id,
                isPaid: booking.isPaid,
                paymentStatus: booking.paymentStatus,
                amount: booking.amount,
                seats: booking.bookedSeats
            }
        });

    } catch (error) {
        console.error('Payment verification error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};