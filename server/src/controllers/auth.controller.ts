import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return 
    }

    // Create new user with default reputation
    const user = await User.create({ 
      username, 
      email, 
      passwordHash: password,
      reputation: 1 // Default reputation for new users
    });
    
    // Generate JWT token
    // const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });

    res.status(201).json({ 
      // token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        reputation: user.reputation
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
    if (!user) {
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
    console.log('ID logged in:', user.id);
    console.log('User logged in:', user.username);
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