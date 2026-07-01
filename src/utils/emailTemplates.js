/**
 * Generates the HTML template for the Password Reset OTP email.
 * @param {string} name - The user's name.
 * @param {string} otp - The 6-digit OTP code.
 * @returns {string} HTML content.
 */
export const otpEmailTemplate = (name, otp) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #333333; text-align: center;">Reset Your Password</h2>
            <p style="font-size: 16px; color: #555555;">Hello ${name},</p>
            <p style="font-size: 16px; color: #555555;">You requested to reset your password. Please use the following One-Time Password (OTP) to proceed. This OTP is valid for 10 minutes:</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #1e88e5; letter-spacing: 5px; background-color: #f5f5f5; padding: 10px 20px; border-radius: 4px; border: 1px dashed #1e88e5;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #888888; text-align: center;">If you did not request this, please ignore this email.</p>
        </div>
    `;
};

/**
 * Generates the HTML template for the Account Verification OTP email.
 * @param {string} name - The user's name.
 * @param {string} otp - The 6-digit OTP code.
 * @returns {string} HTML content.
 */
export const verificationEmailTemplate = (name, otp) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #333333; text-align: center;">Verify Your Account</h2>
            <p style="font-size: 16px; color: #555555;">Hello ${name},</p>
            <p style="font-size: 16px; color: #555555;">Thank you for registering. Please use the following One-Time Password (OTP) to verify your account. This OTP is valid for 10 minutes:</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #2e7d32; letter-spacing: 5px; background-color: #f5f5f5; padding: 10px 20px; border-radius: 4px; border: 1px dashed #2e7d32;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #888888; text-align: center;">If you did not register for an account, please ignore this email.</p>
        </div>
    `;
};

