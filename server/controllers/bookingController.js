import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import axios from 'axios';
import User from "../models/User.js";



// Function to check availability of selected seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId)
        if (!showData) return false;

        const occupiedSeats = showData.occupiedSeats;

        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

export const createBooking = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { showId, selectedSeats } = req.body;
        const { origin } = req.headers;

        // check if the seat is available for the selected show
        const isAvailable = await checkSeatsAvailability(showId, selectedSeats)

        if (!isAvailable) {
            return res.json({ success: false, message: "Selected seats are not available." })
        }

        // Get the show details
        const showData = await Show.findById(showId).populate('movie');

        // Create a new booking
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats
        })

        selectedSeats.map((seat) => {
            showData.occupiedSeats[seat] = userId;
        })

        showData.markModified('occupiedSeats');

        await showData.save();

        // CashFree Gateway Initialize

        const user = await User.findById(userId); // already stored Clerk ID as _id

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }


        // console.log("Cashfree Payload:", {
        //     order_id: `order_${booking._id}`,
        //     order_amount: booking.amount,
        //     order_currency: "INR",
        //     customer_details: {
        //         customer_id: userId,
        //         customer_email: user.email,
        //         customer_phone: "9999999999"
        //     },
        //     order_meta: {
        //         return_url: `${origin}/my-bookings`,
        //         notify_url: `${origin}/api/booking/callback`
        //     }
        // });






        const cashfreeRes = await axios.post(
            process.env.CASHFREE_BASE_URL + '/orders',
            {
                order_id: `order_${booking._id}`,
                order_amount: booking.amount,
                order_currency: "INR",
                customer_details: {
                    customer_id: userId,
                    customer_email: user.email,
                    customer_phone: "9999999999"
                },
                order_meta: {
                    return_url: `${origin}/my-bookings`,
                    notify_url: `${origin}/api/booking/callback`
                }
            },
            {
                headers: {
                    "x-client-id": process.env.CASHFREE_APP_ID,
                    "x-client-secret": process.env.CASHFREE_SECRET_KEY,
                    "x-api-version": "2022-09-01",
                    "Content-Type": "application/json"
                }
            }
        );


        // console.log("Cashfree Response:", cashfreeRes.data);
        // const cleanSessionId = cashfreeRes.data.payment_session_id;
        // console.log("Cleaned Session ID:", cleanSessionId);


        const rawSessionId = cashfreeRes.data.payment_session_id;
const cleanSessionId = rawSessionId.replace(/(payment)+$/, "");

        console.log("Fixed payment session id:", cleanSessionId);

        booking.paymentLink = `${cashfreeRes.data.payments.url}?payment_session_id=${cleanSessionId}`;



        //console.log("Payment Session ID:", cashfreeRes.data.payment_session_id); ////////////


        await booking.save();

        // Send Cashfree link to frontend
        // res.json({
        //     success: true,
        //     url: `https://sandbox.cashfree.com/pg/orders/${cashfreeRes.data.order_id}/payments?payment_session_id=${cleanSessionId}`
        // });


        // console.log("Raw Cashfree response (stringified):", JSON.stringify(cashfreeRes.data, null, 2));


        // Fix session id

        res.json({
            success: true,
            url: `https://sandbox.cashfree.com/pg/orders/${cashfreeRes.data.order_id}/payments?payment_session_id=${cleanSessionId}`
        });


        // res.json({ success: true, message: 'Booked successfully' })

    } catch (error) {
        // console.log(error.message);
        // res.json({ success: false, message: error.message })


        //console.log("Cashfree Error:", error.response?.data || error.message);
        res.json({ success: false, message: error.response?.data?.message || error.message })


    }
}

export const getOccupiedSeats = async (req, res) => {
    try {

        const { showId } = req.params;
        const showData = await Show.findById(showId)

        const occupiedSeats = Object.keys(showData.occupiedSeats)

        res.json({ success: true, occupiedSeats })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}



