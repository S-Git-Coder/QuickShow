import sendEmail from "../configs/nodeMailer.js";

export const submitContactForm = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        // Validate inputs
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide name, email and message" 
            });
        }
        
        // Send email to admin
        await sendEmail({
            to: process.env.ADMIN_EMAIL || "support@quickshow.com",
            subject: `New Contact Form Submission from ${name}`,
            body: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong></p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                        ${message}
                    </div>
                </div>
            `
        });
        
        // Send confirmation to user
        await sendEmail({
            to: email,
            subject: "Thank you for contacting QuickShow",
            body: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Hello ${name},</h2>
                    <p>Thank you for reaching out to us. We've received your message and will get back to you shortly.</p>
                    <p>Best regards,<br/>QuickShow Team</p>
                </div>
            `
        });
        
        res.status(200).json({ success: true, message: "Contact form submitted successfully" });
    } catch (error) {
        console.error("Contact form submission error:", error);
        res.status(500).json({ success: false, message: "Failed to submit contact form" });
    }
};