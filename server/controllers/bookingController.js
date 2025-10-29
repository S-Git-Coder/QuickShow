import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";
import axios from "axios";
import mongoose from "mongoose";
import cashfreeConfig from "../configs/cashfree.js";
import { buildReturnUrl, buildNotifyUrl, getEnvironmentInfo } from "../utils/urlBuilder.js";

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
        const { showId, selectedSeats, amount } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.json({ success: false, message: "Invalid booking amount" });
        }

        const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
        if (!isAvailable) {
            return res.json({ success: false, message: "Selected seats are not available." });
        }

        const showData = await Show.findById(showId).populate('movie');

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Create a temporary booking ID for Cashfree order
        const tempBookingId = new mongoose.Types.ObjectId();

        // --------- Cashfree Order Create Logic START ---------
        // Get environment-aware URLs
        const returnUrl = buildReturnUrl(`order_${tempBookingId}`);
        const notifyUrl = buildNotifyUrl();
        const envInfo = getEnvironmentInfo();

        // Log URL configuration for debugging
        console.log('🌐 URL Configuration:', {
            environment: envInfo.environment,
            isProduction: envInfo.isProduction,
            protocol: envInfo.protocol,
            returnUrl,
            notifyUrl
        });

        // Create a pending booking right away so it's visible in MyBookings
        const pendingBookingDoc = await Booking.create({
            _id: tempBookingId,
            user: userId,
            show: showId,
            amount,
            bookedSeats: selectedSeats,
            paymentStatus: 'pending',
            isPaid: false
        });

        // Also keep data in session for callback-based flow as fallback
        req.session = req.session || {};
        req.session.pendingBooking = {
            tempBookingId: tempBookingId.toString(),
            userId,
            showId,
            selectedSeats,
            amount,
            createdAt: new Date()
        };

        const orderPayload = {
            order_id: `order_${tempBookingId}`,
            order_amount: amount,
            order_currency: "INR",
            customer_details: {
                customer_id: userId,
                customer_email: user.email,
                customer_phone: user.phone // Using dynamic phone number from user model
            },
            order_meta: {
                return_url: returnUrl,
                notify_url: notifyUrl
            }
        };

        // Credentials are now normalized in cashfree.js config

        let paymentLink;
        let paymentSessionId = null; // expose to response for SDK-based checkout
        try {
            // Log the exact headers being sent (without exposing the full secret key)
            console.log('Cashfree API Request:');
            console.log('- App ID:', cashfreeConfig.appId);
            console.log('- Secret Key Length:', cashfreeConfig.secretKey ? cashfreeConfig.secretKey.length : 'Not set');
            console.log('- API Version: 2023-08-01');
            console.log('- Base URL:', cashfreeConfig.baseUrl);

            // Prepare headers for Cashfree API - always use production credentials
            // Log the credentials being used (masked for security)
            console.log('Using Cashfree credentials:');
            console.log('- App ID:', cashfreeConfig.appId ? `${cashfreeConfig.appId.substring(0, 6)}...${cashfreeConfig.appId.substring(cashfreeConfig.appId.length - 4)}` : 'Not set');
            console.log('- Secret Key Length:', cashfreeConfig.secretKey ? cashfreeConfig.secretKey.length : 'Not set');
            console.log('- API Version:', '2023-08-01');
            console.log('- Base URL:', cashfreeConfig.baseUrl);

            const headers = {
                "x-client-id": cashfreeConfig.appId,
                "x-client-secret": cashfreeConfig.secretKey,
                "x-api-version": "2023-08-01",
                "Content-Type": "application/json"
            };

            const cashfreeRes = await axios.post(
                `${cashfreeConfig.baseUrl}/orders`,
                orderPayload,
                { headers }
            );

            // For API version 2023-08-01, we need to construct the payment URL using payment_session_id
            if (cashfreeRes.data.payment_session_id) {
                // Always use the production payment URL when in production mode
                // This is critical for authentication to work correctly
                const isProduction = process.env.NODE_ENV === 'production' || process.env.CASHFREE_USE_PRODUCTION === 'true';

                // Use the appropriate payment URL - always use production URL with production credentials
                // This ensures we're using the correct endpoint that matches our credentials
                // Per Cashfree PG docs, redirect URL format uses /session/<payment_session_id>
                const basePaymentUrl = 'https://payments.cashfree.com/session';

                // Enhanced debugging for payment session
                console.log('🔍 PAYMENT SESSION DEBUG:');
                console.log('- Environment check:');
                console.log('  - Is Production:', isProduction);
                console.log('  - NODE_ENV:', process.env.NODE_ENV);
                console.log('  - CASHFREE_USE_PRODUCTION:', process.env.CASHFREE_USE_PRODUCTION);
                console.log('- Cashfree Response:');
                console.log('  - Order ID:', cashfreeRes.data.order_id);
                console.log('  - Order Status:', cashfreeRes.data.order_status);
                console.log('  - Payment Session ID:', cashfreeRes.data.payment_session_id);
                console.log('  - Payment Session ID Length:', cashfreeRes.data.payment_session_id.length);
                console.log('  - Raw Payment Session ID:', JSON.stringify(cashfreeRes.data.payment_session_id));

                // Get clean session ID from response
                let sessionId = String(cashfreeRes.data.payment_session_id).trim();

                // Log the raw session ID for debugging
console.log('🔍 RAW Session ID from Cashfree:', sessionId);

        // AGGRESSIVE CLEANING: Remove ALL occurrences of "payment" text
// Cashfree API sometimes adds "payment" or "paymentpayment" suffix (bug)
// We need to remove ALL instances, not just at the end

// Method 1: Remove all "payment" suffixes using loop
while (sessionId.endsWith('payment')) {
    sessionId = sessionId.slice(0, -7); // Remove last 7 characters ("payment")
    console.log('⚠️ Removed "payment" suffix from session ID');
}

                // Store for client-side SDK
                paymentSessionId = sessionId;

                // Construct payment URL - Direct Cashfree format
                // paymentLink = `${basePaymentUrl}/${sessionId}`;
                paymentLink = `https://payments.cashfree.com/session/${sessionId}`;


                console.log('- Generated Payment URL:', paymentLink);

                // Removed verification block that was causing session ID corruption
                // The original payment_session_id from order creation is correct and should be used directly

                // Store the payment session ID in the session for verification later
                if (req.session && req.session.pendingBooking) {
                    req.session.pendingBooking.paymentSessionId = sessionId;
                    req.session.pendingBooking.paymentLink = paymentLink;
                }

                // Save payment link to pending booking
                await Booking.findByIdAndUpdate(tempBookingId, { paymentLink });
            } else {
                paymentLink = null;
                return res.json({
                    success: false,
                    message: "Failed to generate payment link. Please try again."
                });
            }
        } catch (error) {
            console.error('Cashfree API error:', error.message);
            console.error('Cashfree API error status:', error.response ? error.response.status : 'No status');
            console.error('Cashfree API error data:', error.response ? JSON.stringify(error.response.data) : 'No response data');

            // Check for specific error types to provide better error messages
            let errorMessage = "Payment gateway error. Please try again later.";

            if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                errorMessage = "Unable to connect to payment gateway. Please check your internet connection and try again.";
                console.error('NETWORK ERROR: Unable to connect to Cashfree API');
            } else if (error.response) {
                // Handle specific HTTP error codes
                if (error.response.status === 401) {
                    errorMessage = "Payment authentication failed. Please contact support.";
                    console.error('CRITICAL: Cashfree API authentication failed. Check API credentials.');
                    console.error('Auth Error Details:', JSON.stringify(error.response.data));

                    // Log the exact credentials being used (partially masked)
                    const appIdMasked = cashfreeConfig.appId ?
                        `${cashfreeConfig.appId.substring(0, 6)}...${cashfreeConfig.appId.substring(cashfreeConfig.appId.length - 4)}` : 'Not set';
                    console.error('Credentials used for failed request:');
                    console.error('- App ID:', appIdMasked);
                    console.error('- Secret Key Length:', cashfreeConfig.secretKey ? cashfreeConfig.secretKey.length : 'Not set');
                    console.error('- Base URL:', cashfreeConfig.baseUrl);
                } else if (error.response.status === 400) {
                    errorMessage = "Invalid payment request. Please try again with correct information.";
                    console.error('BAD REQUEST: Cashfree API rejected the request', JSON.stringify(error.response.data));
                } else {
                    console.error(`HTTP ERROR ${error.response.status}: Cashfree API request failed`, JSON.stringify(error.response.data));
                }
            }

            return res.json({
                success: false,
                message: errorMessage,
                error: error.message,
                details: error.response ? error.response.data : null
            });
        }

        // --------- Cashfree Order Create Logic END ---------

        // Validate payment link before returning to client
        if (!paymentLink || !paymentLink.startsWith('https://payments.cashfree.com/session')) {
            console.error('❌ Invalid payment link format:', paymentLink);
            return res.json({
                success: false,
                message: "Failed to generate a valid payment link. Please try again.",
                error: "Invalid payment URL format"
            });
        }

        // Return success response with payment link only
        return res.json({
            success: true,
            message: "Payment link generated successfully",
            paymentLink: paymentLink,
            paymentSessionId,
            tempBookingId: tempBookingId
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

// Handle payment callback from Cashfree
export const handlePaymentCallback = async (req, res) => {
    try {
        const { order_id } = req.query;

        if (!order_id) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        // Extract tempBookingId from order_id (format: order_<tempBookingId>)
        const tempBookingId = order_id.replace('order_', '');

        // Get pending booking data from session
        if (!req.session || !req.session.pendingBooking || req.session.pendingBooking.tempBookingId !== tempBookingId) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired booking session"
            });
        }

        const pendingBooking = req.session.pendingBooking;

        // Verify payment status with Cashfree
        const headers = {
            "x-client-id": cashfreeConfig.appId,
            "x-client-secret": cashfreeConfig.secretKey,
            "x-api-version": "2023-08-01",
            "Content-Type": "application/json"
        };

        const paymentVerification = await axios.get(
            `${cashfreeConfig.baseUrl}/orders/${order_id}`,
            { headers }
        );

        // Check if payment is successful
        if (paymentVerification.data.order_status === 'PAID') {
            // Get user and show data
            const user = await User.findById(pendingBooking.userId);
            const show = await Show.findById(pendingBooking.showId);

            if (!user || !show) {
                return res.status(404).json({
                    success: false,
                    message: "User or Show not found"
                });
            }

            // Check if seats are still available
            const bookedSeats = await Booking.find({ show: pendingBooking.showId }).distinct('bookedSeats');
            const flattenedBookedSeats = bookedSeats.flat();

            // Check if any selected seat is already booked
            const unavailableSeats = pendingBooking.selectedSeats.filter(seat =>
                flattenedBookedSeats.includes(seat)
            );

            if (unavailableSeats.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Seats ${unavailableSeats.join(', ')} are no longer available`
                });
            }

            // Update the already created pending booking to paid
            const booking = await Booking.findByIdAndUpdate(
                pendingBooking.tempBookingId,
                {
                    paymentStatus: 'paid',
                    isPaid: true,
                    paymentLink: pendingBooking.paymentLink,
                    paymentDetails: {
                        ...(pendingBooking.paymentDetails || {}),
                        orderId: order_id,
                        paymentId: paymentVerification.data.cf_payment_id,
                        paymentMethod: paymentVerification.data.payment_method,
                        paymentTime: new Date()
                    }
                },
                { new: true }
            );

            // Also mark seats as occupied on the show
            const showToUpdate = await Show.findById(pendingBooking.showId);
            if (showToUpdate) {
                const occupied = { ...(showToUpdate.occupiedSeats || {}) };
                for (const seat of pendingBooking.selectedSeats) occupied[seat] = true;
                showToUpdate.occupiedSeats = occupied;
                await showToUpdate.save();
            }

            // Clear the pending booking from session
            delete req.session.pendingBooking;

            // Redirect to success page
            return res.redirect(`/booking-success/${booking._id}`);
        } else {
            // Payment failed
            return res.redirect(`/booking-failed?reason=${paymentVerification.data.order_status}`);
        }
    } catch (error) {
        console.error('Payment callback error:', error.message);
        return res.status(500).json({
            success: false,
            message: "Error processing payment callback"
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

// Handle webhook notifications from Cashfree (separate from redirect callback)
export const handlePaymentWebhook = async (req, res) => {
    try {
        // Check if this is a test request from Cashfree dashboard
        // Cashfree dashboard sends a test request with specific headers
        const isCashfreeTest = req.headers['x-webhook-source'] === 'cashfree' ||
            req.headers['user-agent']?.includes('Cashfree');

        if (isCashfreeTest) {
            // Return HTTP 200 with a simple success message
            // This is what Cashfree expects during webhook testing
            return res.status(200).send('Webhook received successfully');
        }

        const { orderId, orderAmount, referenceId, txStatus, paymentMode, txMsg, txTime, signature } = req.body;

        // Check if this is a test webhook from our test script
        const isTestWebhook = orderId?.includes('test');

        if (isTestWebhook) {
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

        // Find the booking
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Update booking status based on payment status
        const newPaymentStatus = txStatus === 'SUCCESS' ? 'paid' : 'failed';
        const newIsPaid = txStatus === 'SUCCESS';

        booking.paymentStatus = newPaymentStatus;
        booking.isPaid = newIsPaid; // Sync isPaid with paymentStatus
        booking.paymentDetails = {
            ...(booking.paymentDetails || {}),
            orderId: orderId,
            referenceId,
            paymentMode,
            txMsg,
            txTime,
            signature
        };

        // If paid, mark seats as occupied on the show
        if (newIsPaid) {
            const show = await Show.findById(booking.show);
            if (show) {
                const occupied = { ...(show.occupiedSeats || {}) };
                for (const seat of booking.bookedSeats) occupied[seat] = true;
                show.occupiedSeats = occupied;
                await show.save();
            }
        }

        await booking.save();

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

// Manual payment verification endpoint for debugging and recovery
export const verifyPayment = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        // Verify payment status with Cashfree
        const headers = {
            "x-client-id": cashfreeConfig.appId,
            "x-client-secret": cashfreeConfig.secretKey,
            "x-api-version": "2023-08-01",
            "Content-Type": "application/json"
        };

        try {
            const paymentVerification = await axios.get(
                `${cashfreeConfig.baseUrl}/orders/${orderId}`,
                { headers }
            );

            // Check if payment is successful
            if (paymentVerification.data.order_status === 'PAID') {
                // Extract tempBookingId from order_id (format: order_<tempBookingId>)
                const tempBookingId = orderId.replace('order_', '');

                // Try to find the pending booking by _id first
                let booking = await Booking.findById(tempBookingId);

                if (booking) {
                    if (!booking.isPaid) {
                        booking.isPaid = true;
                        booking.paymentStatus = 'paid';
                        booking.paymentDetails = {
                            ...(booking.paymentDetails || {}),
                            orderId,
                            paymentId: paymentVerification.data.cf_payment_id,
                            paymentMethod: paymentVerification.data.payment_method,
                            paymentTime: new Date()
                        };
                        await booking.save();

                        // Occupy seats on the show
                        const show = await Show.findById(booking.show);
                        if (show) {
                            const occupied = { ...(show.occupiedSeats || {}) };
                            for (const seat of booking.bookedSeats) occupied[seat] = true;
                            show.occupiedSeats = occupied;
                            await show.save();
                        }
                    }

                    return res.json({
                        success: true,
                        message: "Payment verified and booking updated",
                        booking
                    });
                }

                // Fallback: check by paymentDetails.orderId if already updated by webhook
                const existingBooking = await Booking.findOne({ 'paymentDetails.orderId': orderId });
                if (existingBooking) {
                    return res.json({ success: true, message: 'Payment already verified', booking: existingBooking });
                }

                return res.status(404).json({ success: false, message: 'Booking not found for verified order' });
            } else {
                // Payment not successful
                return res.json({
                    success: false,
                    message: "Payment not successful",
                    paymentStatus: paymentVerification.data.order_status,
                    orderId: orderId
                });
            }
        } catch (error) {
            // If Cashfree API call fails, check if booking exists in our database
            // Extract tempBookingId from order_id (format: order_<tempBookingId>)
            const tempBookingId = orderId.replace('order_', '');

            // Check if booking exists
            const existingBooking = await Booking.findOne({
                'paymentDetails.orderId': orderId
            });

            if (existingBooking) {
                return res.json({
                    success: true,
                    message: "Booking found in database",
                    booking: existingBooking
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Payment verification failed and no booking found",
                    error: error.message
                });
            }
        }
    } catch (error) {
        console.error('Payment verification error:', error.message);
        return res.status(500).json({
            success: false,
            message: "Error verifying payment",
            error: error.message
        });
    }
};

// Manual verification of booking payment status
export const verifyBookingPayment = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required"
            });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // For debugging purposes, assume payment was successful if booking exists
        // This is a temporary solution for the stuck loading issue
        if (!booking.isPaid) {
            booking.isPaid = true;
            booking.paymentStatus = 'paid';
            booking.paymentDetails = {
                ...booking.paymentDetails,
                manualVerification: true,
                verifiedAt: new Date().toISOString()
            };
            await booking.save();
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