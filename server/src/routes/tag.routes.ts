import express from 'express';
import { getTags, createTag, getTagById } from '../controllers/tag.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/', getTags);
router.post('/new', authMiddleware, createTag);
router.get('/:id', getTagById);

export default router;