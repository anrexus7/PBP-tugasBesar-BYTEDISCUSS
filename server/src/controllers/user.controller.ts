import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { controllerWrapper } from './wrapper.controller';
import { ApiError } from '../middlewares/errorHandler.middleware';

// declare global {
//   namespace Express {
//     interface Request {
//       file?: {
//         originalname: string;
//         buffer: Buffer;
//       };
//     }
//   }
// }

const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const deleteOldFile = (filePath: string) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const getCurrentUser = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const user = await User.findByPk(req.userId, {
    attributes: { exclude: ['passwordHash'] },
    include: [
      {
        association: 'questions',
        attributes: ['id', 'content','title', 'createdAt'],
        order: [['createdAt', 'DESC']]
      },
      {
        association: 'answers',
        attributes: ['id', 'content','questionId', 'createdAt'],
        order: [['createdAt', 'DESC']]
      },
      {
        association: 'votes',
        attributes: ['questionId', 'answerId', 'value']
      }
    ]
  });

  if (!user) {
    return next(new ApiError(404, 'Current user profile not found'));
  }
  // Combine votes into a flat array for frontend
  const userJson = user.toJSON();
  userJson.votes = userJson.votes || [];
  res.status(200).json(userJson);
});

export const updateCurrentUser = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const userId = req.userId;
  const { username, email, bio, currentPassword, newPassword } = req.body;

  const user = await User.findByPk(userId);
  if (!user) {
    return next(new ApiError(404, 'User account not found for update'));
  }

  // Update basic info
  if (username) user.username = username;
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return next(new ApiError(400, 'Email address is already registered to another account'));
    }
    user.email = email;
  }
  if (bio) user.bio = bio;

  // Update password if provided
  if (currentPassword && newPassword) {
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new ApiError(400, 'Current password verification failed'));
    }
    user.passwordHash = newPassword;
    
    const bcrypt = require('bcrypt');
    user.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  await user.save();
  // Return updated user without sensitive data
  const updatedUser = await User.findByPk(userId, {
    attributes: { exclude: ['passwordHash'] }
  });

  res.status(200).json(updatedUser);
});

export const uploadProfilePicture = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const userId = req.userId;
  
  if (!req.file) {
    return next(new ApiError(400, 'Profile picture file is required for upload'));
  }

  const user = await User.findByPk(userId);
  if (!user) {
    return next(new ApiError(404, 'User account not found for profile picture update'));
  }

  // Hapus file lama jika ada
  if (user.profilePicture) {
    const oldFilePath = path.join(__dirname, '../../uploads', user.profilePicture);
    deleteOldFile(oldFilePath);
  }

  // Generate nama file unik
  const fileExt = path.extname(req.file.originalname);
  const fileName = `${uuidv4()}${fileExt}`;
  const filePath = path.join(__dirname, '../../uploads', fileName);

  // Simpan file
  fs.writeFileSync(filePath, req.file.buffer);
  // Update database
  user.profilePicture = fileName;
  await user.save();

  res.status(200).json({ 
    profilePicture: `/uploads/${fileName}`,
    message: 'Profile picture updated successfully' 
  });
});

export const deleteCurrentUser = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const userId = req.userId;

  const user = await User.findByPk(userId);
  if (!user) {
    return next(new ApiError(404, 'User account not found for deletion'));
  }

  // Hapus profile picture jika ada
  if (user.profilePicture) {
    const filePath = path.join(__dirname, '../../uploads', user.profilePicture);
    deleteOldFile(filePath);
  }
  await user.destroy();

  res.status(200).json({ message: 'User account deleted successfully' });
});