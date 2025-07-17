import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_SECRET!;

// Function to generate an access token
export const generateAccessToken = (userId: string) => {
    return jwt.sign(
        { userId },
        ACCESS_SECRET,
        { expiresIn: "15m" 
        }
    );
};