import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";


// API to check if user is admin
export const isAdmin = async (req, res) => {
    res.json({ success: true, isAdmin: true })
}

// API to get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const bookings = await Booking.find({ isPaid: true });
        const activeShows = await Show.find({ showDateTime: { $gte: new Date() } }).populate('movie');

        const totalUser = await User.countDocuments();

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
            activeShows,
            totalUser
        }
        res.json({ success: true, dashboardData })
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

// API to get all shows
export const getAllShows = async (req, res) => {
    try {
        const shows = await Show.find({ showDateTime: { $gte: new Date() } }).populate('movie').sort({ showDateTime: 1 })
        res.json({ success: true, shows });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

// API to get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({}).populate('user').populate({
            path: "show",
            populate: { path: "movie" }
        }).sort({ createdAt: -1 });
        res.json({ success: true, bookings })
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

// API to delete shows
export const deleteShows = async (req, res) => {
    try {
        const { showIds } = req.body;
        
        if (!showIds || !Array.isArray(showIds) || showIds.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Show IDs are required and must be a non-empty array" 
            });
        }
        
        // Delete shows with the provided IDs
        const result = await Show.deleteMany({ _id: { $in: showIds } });
        
        if (result.deletedCount > 0) {
            res.json({ 
                success: true, 
                message: `Successfully deleted ${result.deletedCount} show(s)` 
            });
        } else {
            res.json({ 
                success: false, 
                message: "No shows were deleted. Shows may not exist or have already been deleted." 
            });
        }
    } catch (error) {
        console.error("Error deleting shows:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "An error occurred while deleting shows" 
        });
    }
}