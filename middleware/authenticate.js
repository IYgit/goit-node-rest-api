import jwt from 'jsonwebtoken';
import models from '../models/index.js'; // Using the same import pattern as authController
const { User } = models;
import HttpError from '../helpers/HttpError.js';

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(HttpError(401, 'Not authorized: No Authorization header'));
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return next(HttpError(401, 'Not authorized: Malformed token'));
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'default-super-secret-key-for-dev'; // Same as in login
    const decoded = jwt.verify(token, jwtSecret);

    // Find user by ID from token and ensure they still have a valid token session
    // (e.g., token in DB matches the one provided, or simply that user.token exists if single-session)
    const user = await User.findOne({ where: { id: decoded.id } });

    if (!user || user.token !== token) {
      // If user not found, or if the token stored in DB doesn't match the one presented
      // (could mean user logged out, or token was reissued/revoked)
      return next(HttpError(401, 'Not authorized: User not found or token invalid/revoked'));
    }

    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    // Handle JWT errors (expired, invalid signature etc.)
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return next(HttpError(401, `Not authorized: ${error.message}`));
    }
    // For other unexpected errors
    console.error("Authentication Error:", error);
    next(HttpError(500, 'Internal Server Error during authentication'));
  }
};

export default authenticate;
