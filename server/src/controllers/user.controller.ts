import { Request, Response } from 'express';
import { User } from '../models/User';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';


declare global {
  namespace Express {
    interface Request {
      file?: {
        originalname: string;
        buffer: Buffer;
      };
    }
  }
}

const deleteOldFile = (filePath: string) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          association: 'questions',
          attributes: ['id', 'content', 'createdAt'],
          limit: 5,
          order: [['createdAt', 'DESC']]
        },
        {
          association: 'answers',
          attributes: ['id', 'content', 'createdAt'],
          limit: 5,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return 
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.userId;
    const { username, email, bio, currentPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return 
    }

    // Update basic info
    if (username) user.username = username;
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        res.status(400).json({ message: 'Email already in use' });
        return 
      }
      user.email = email;
    }
    if (bio) user.bio = bio;

    // Update password if provided
    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(400).json({ message: 'Current password is incorrect' });
        return 
      }
      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    // Return updated user without sensitive data
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.userId;
    
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return 
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return 
    }

    // Hapus file lama jika ada
    if (user.profilePicture) {
      const oldFilePath = path.join(__dirname, '../uploads', user.profilePicture);
      deleteOldFile(oldFilePath);
    }

    // Generate nama file unik
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(__dirname, '../uploads', fileName);

    // Simpan file
    fs.writeFileSync(filePath, req.file.buffer);

    // Update database
    user.profilePicture = fileName;
    await user.save();

    res.json({ 
      profilePicture: `/uploads/${fileName}`,
      message: 'Profile picture updated successfully' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCurrentUser = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return 
    }

    // Hapus profile picture jika ada
    if (user.profilePicture) {
      const filePath = path.join(__dirname, '../uploads', user.profilePicture);
      deleteOldFile(filePath);
    }

    await user.destroy();

    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};