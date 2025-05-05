import { Router } from 'express';
import { 
  getCurrentUser,
  updateCurrentUser,
  uploadProfilePicture,
  deleteCurrentUser,
} from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import multer from 'multer';
import rateLimit from 'express-rate-limit';

const router = Router();

// Inisialisasi multer dengan batasan file
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});


const updateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many update requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Protected endpoints
router.get('/me', authMiddleware, getCurrentUser);
router.put('/me', authMiddleware, updateLimiter, updateCurrentUser);
router.delete('/me', authMiddleware, deleteCurrentUser);
router.put(
  '/me/avatar', 
  authMiddleware, 
  upload.single('avatar'), 
  uploadProfilePicture
);

export default router;