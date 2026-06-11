import nodemailer from "nodemailer";

export const sendEmail = async ({ email, subject, html }) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || "gmail",
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const info = await transporter.sendMail({
        from: `"Project Management System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html,
    });

    return info;
};
