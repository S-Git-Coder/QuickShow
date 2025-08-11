import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import { model } from "mongoose";
import sendEmail from "../configs/nodeMailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk' },
    { event: 'clerk/user.created' },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.create(userData)
    }
)

// Inngest Function to delete user data from a database
const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-with-clerk' },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
        const { id } = event.data
        await User.findByIdAndDelete(id)
    }
)

// Inngest Function to update user data in a database
const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk' },
    { event: 'clerk/user.updated' },
    async ({ event }) => {
        const { id } = event.data
        await User.findByIdAndDelete(id)
    }
)

// Inngest Function to send email when user books a show
const sendBookingConfirmationEmail = inngest.createFunction(
    { id: "send-booking-confirmation-email" },
    { event: 'app/show.booked' },
    async ({ event, step }) => {
        const { bookingId } = event.data;

        const booking = await Booking.findById(bookingId).populate({
            path: 'show',
            populate: { path: "movie", model: "Movie" }
        }).populate('user');

        if (!booking) return { message: 'Booking not found', bookingId };
        if (booking.confirmationEmailSent) return { message: 'Email already sent', bookingId };

        const showDate = new Date(booking.show.showDateTime);

        await sendEmail({
            to: booking.user.email,
            subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
            body: ` <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                <h2>Hi ${booking.user.name},</h2>
                <p>Your booking for <strong style="color: #F84565;">"${booking.show.movie.title}"</strong> is confirmed.</p>
                <p>
                    <strong>Date:</strong> ${showDate.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}<br />
                    <strong>Time:</strong> ${showDate.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}
                </p>
                <p>Enjoy the show! 🍿</p>
                <p>Thanks for booking with us!<br />- QuickShow Team</p>
            </div>`
        })

        // Mark as sent to avoid duplicates
        try {
            booking.confirmationEmailSent = true;
            await booking.save();
        } catch (e) {
            console.error('Failed to mark confirmationEmailSent:', e.message);
        }
    }
)

// Inngest Function to send reminders
const sendShowReminders = inngest.createFunction(
    { id: "send-show-reminders" },
    { cron: "0 */8 * * *" }, // Every 8 hours
    async ({ step }) => {
        const now = new Date();
        const in8Hours = new Date(now.getTime() + 8 * 60 * 60 * 1000);
        const windowStart = new Date(in8Hours.getTime() - 10 * 60 * 1000);

        // Prepare reminder tasks from paid bookings tied to shows starting in ~8 hours
        const reminderTasks = await step.run("prepare-reminder-tasks", async () => {
            // Find shows starting within the window
            const shows = await Show.find({
                showDateTime: { $gte: windowStart, $lte: in8Hours },
            }).populate('movie');

            if (!shows.length) return [];

            // Find paid bookings for these shows which haven't received a reminder yet
            const showIds = shows.map(s => s._id.toString());
            const bookings = await Booking.find({
                show: { $in: showIds },
                isPaid: true,
                reminderSent: { $ne: true }
            }).populate('user');

            const tasks = [];
            const showMap = new Map(shows.map(s => [s._id.toString(), s]));

            for (const b of bookings) {
                const show = showMap.get(b.show);
                if (!show || !b.user) continue;
                tasks.push({
                    bookingId: b._id.toString(),
                    userEmail: b.user.email,
                    userName: b.user.name,
                    movieTitle: show.movie?.title || 'your movie',
                    showTime: show.showDateTime,
                });
            }
            return tasks;
        });
        if (reminderTasks.length === 0) {
            return { sent: 0, message: "No reminders to send." }
        }

        // Send reminder emails and mark reminderSent
        const results = await step.run('send-all-reminders', async () => {
            return await Promise.allSettled(
                reminderTasks.map(async task => {
                    await sendEmail({
                        to: task.userEmail,
                        subject: `Reminder: Your movie "${task.movieTitle}" starts soon!`,
                        body: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2>Hello ${task.userName},</h2>
                            <p>This is a quick reminder that your movie:</p>
                            <h3 style="color: #F84565;">"${task.movieTitle}"</h3>
                            <p>
                                is scheduled for <strong>${new Date(task.showTime).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}</strong> at <strong>${new Date(task.showTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}</strong>.
                            </p>
                            <p>It starts in approximately <strong>8 hours</strong> - make sure you're ready!</p>
                            <br/>
                            <p>Enjoy the show!<br/>QuickShow Team</p>
                        </div>`
                    });
                    // Mark reminder sent
                    await Booking.findByIdAndUpdate(task.bookingId, { reminderSent: true });
                })
            )
        });

        const sent = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.length - sent;

        return {
            sent,
            failed,
            message: `Sent ${sent} reminder(s), ${failed} failed.`
        }
    }
)

// Inngest Function to send notifications when a new show is added
const sendNewShowNotifications = inngest.createFunction(
    { id: "send-new-show-notifications" },
    { event: "app/show.added" },
    async ({ event }) => {
        const { movieTitle } = event.data;

        const users = await User.find({})

        for (const user of users) {
            const userEmail = user.email;
            const userName = user.name;

            const subject = `🎬 New Show Added: ${movieTitle}`;
            const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Hi ${userName},</h2>
                <p>We've just added a new show to our library:</p>
                <h3 style="color: #F84565;">"${movieTitle}"</h3>
                <p>Visit our website</p>
                <br/>
                <p>Thanks,<br/>QuickShow Team</p>
            </div>`;

            await sendEmail({
                to: userEmail,
                subject,
                body,
            })
        }
        return { message: "Notifications sent." }
    }
)


export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, sendBookingConfirmationEmail, sendShowReminders, sendNewShowNotifications];

// Cleanup stale pending bookings (older than 30 minutes)
const cleanupStaleBookings = inngest.createFunction(
    { id: "cleanup-stale-bookings" },
    { cron: "*/15 * * * *" }, // every 15 minutes
    async () => {
        const cutoff = new Date(Date.now() - 30 * 60 * 1000);
        const stale = await Booking.find({ isPaid: false, paymentStatus: 'pending', createdAt: { $lt: cutoff } });

        let cleaned = 0;
        for (const b of stale) {
            // Optionally free up seats if they were tentatively held (if you had such a mechanism). Here we only mark failed.
            b.paymentStatus = 'failed';
            await b.save();
            cleaned++;
        }

        return { cleaned };
    }
);

export const scheduled = [cleanupStaleBookings];

// Also expose cleanup in main functions list for the serve() registration
functions.push(cleanupStaleBookings);