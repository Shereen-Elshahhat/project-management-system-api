import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, name: user.name, role: user.role, rnd: Math.random().toString(36).substring(7) },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id, jti: Math.random().toString(36).substring(7) },
        process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET + "_refresh"),
        { expiresIn: "7d" }
    );
};
