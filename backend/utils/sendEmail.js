const nodemailer = require("nodemailer");

// Send reset password email
const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    console.log("Sending email to:", to);

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: to, 
        subject: subject,
        html: `<p>${text}</p>`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = sendEmail;
