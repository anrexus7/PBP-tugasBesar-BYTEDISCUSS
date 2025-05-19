import { Router } from 'express';
import { 
  createComment,
  updateComment,
  deleteComment,
  getComments,
  createQuestionComment,
  createAnswerComment
} from '../controllers/comment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getComments);
router.post('/questions/:id/comments', authMiddleware, createQuestionComment);
router.post('/answers/:id/comments', authMiddleware, createAnswerComment);
router.post('/', authMiddleware, createComment);
router.put('/:id', authMiddleware, updateComment);
router.delete('/:id', authMiddleware, deleteComment);

export default router;