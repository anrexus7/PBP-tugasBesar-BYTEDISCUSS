import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import path from 'path';

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

// auth.controller.ts
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'Email already exists' });
      return 
    }

    // Create user with default profile picture
    const user = await User.create({
      username,
      email,
      passwordHash: password,
      profilePicture: 'defaultPic.png' // Set default profile picture
    });

    // Generate token
    // const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    //   expiresIn: '1d'
    // });

    res.status(201).json({ 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user || user.deletedAt) {
      res.status(400).json({ message: 'Invalid credentials' });
      return 
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return 
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const logout = async (req: Request, res: Response) => {
  try {
    // In a real app, you might want to invalidate the token
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};