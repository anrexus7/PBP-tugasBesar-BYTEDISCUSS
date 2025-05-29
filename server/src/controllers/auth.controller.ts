import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import path from 'path';
import { controllerWrapper } from './wrapper.controller';
import { ApiError } from '../middlewares/errorHandler.middleware';

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

// Register with wrapper
export const register = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;
  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return next(new ApiError(400, 'Email already exists'));
  }

  // Create user with default profile picture
  const user = await User.create({
    username,
    email,
    passwordHash: password,
    profilePicture: 'defaultPic.png'
  });

  res.status(201).json({ 
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture
    } 
  });
});

export const login = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
    // Find user by email
  const user = await User.findOne({ where: { email } });
  if (!user || user.deletedAt) {
    return next(new ApiError(400, 'Invalid credentials'));
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ApiError(400, 'Invalid credentials'));
  }
  
  // Generate JWT token
  const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });

  res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

export const logout = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ message: 'Logged out successfully' });
});