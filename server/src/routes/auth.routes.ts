import { Router } from 'express';
import { 
  register, 
  login, 
  logout, 
} from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import multer from 'multer';
import path from 'path';

const router = Router();

// Jika Anda menggunakan multer atau middleware upload lainnya
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Gunakan middleware ini hanya untuk route yang memerlukan upload

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);

export default router;