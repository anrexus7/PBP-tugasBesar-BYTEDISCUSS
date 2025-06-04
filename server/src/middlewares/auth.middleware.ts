import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.header('Authorization');

  console.log('Authorization header:', authHeader?.startsWith('Bearer '));

  if (!authHeader && !authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token, authorization denied' });
    return;
  }

  const token = authHeader.split(' ')[1]; // Ambil bagian setelah "Bearer "

  try {
    const decoded = jwt.verify(token, jwtSecret) as { id: string };
    console.log('Decoded user ID:', decoded.id);
    
    // Simpan userId ke dalam req agar bisa diakses di controller
    (req as any).userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
