import bcrypt from 'bcryptjs';
import models from '../models/index.cjs'; // Changed to .cjs, direct import
const { User } = models; // 'models' is now the module.exports object
import HttpError from '../helpers/HttpError.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw HttpError(409, 'Email in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

    // Create new user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      // subscription defaults to 'starter' as per model definition
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    // If it's not an HttpError, it might be a Sequelize validation error or other unexpected error
    if (!error.status) {
        // Log the error for debugging if it's unexpected
        console.error("Registration Error:", error);
        // Check for SequelizeUniqueConstraintError specifically
        if (error.name === 'SequelizeUniqueConstraintError') {
            return next(HttpError(409, 'Email in use'));
        }
        return next(HttpError(500, "Internal Server Error"));
    }
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // req.user is populated by the authenticate middleware
    const user = req.user;

    user.token = null; // Clear the token
    await user.save();

    res.status(204).send(); // Send 204 No Content
  } catch (error) {
    console.error("Logout Error:", error);
    next(HttpError(500, "Internal Server Error"));
    // Removed erroneous import from here
  }
};

export const getCurrentUser = async (req, res, next) => {
  // req.user is populated by the authenticate middleware
  // It contains the full user object including email and subscription
  try {
    const { email, subscription } = req.user;
    res.status(200).json({ email, subscription });
  } catch (error) {
    // This catch block might be redundant if req.user is guaranteed by middleware,
    // but good for safety if middleware somehow passes without user or req.user is malformed.
    console.error("GetCurrentUser Error:", error);
    next(HttpError(500, "Internal Server Error"));
  }
};

// Login controller
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw HttpError(401, 'Email or password invalid'); // Generic message for security
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw HttpError(401, 'Email or password invalid');
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'default-super-secret-key-for-dev'; // Default for dev if not set
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h'; // Default expiration

    const payload = {
      id: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

    // Store token in user record (or manage tokens separately if multiple logins/devices are supported)
    // For this implementation, we'll store the latest token on the user model.
    user.token = token;
    await user.save();

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    if (!error.status) {
        console.error("Login Error:", error);
        return next(HttpError(500, "Internal Server Error"));
    }
    next(error);
  }
};
