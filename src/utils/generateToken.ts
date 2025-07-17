import jwt from 'jsonwebtoken';

const ACCESS_SECRET = "secret123utd";

// Function to generate an access token
export const generateAccessToken = (userId: string) => {
    return jwt.sign(
        { userId },
        ACCESS_SECRET,
        { expiresIn: "15m" 
        }
    );
};