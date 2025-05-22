import express from 'express';
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  postAnswer,
  updateAnswer,
  deleteAnswer
} from '../controllers/question_answer.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/questions', getAllQuestions);
router.get('/questions/:id', getQuestionById);
router.post('/questions/new', authMiddleware,  createQuestion);
router.put('/questions/:id', authMiddleware, updateQuestion);
router.delete('/questions/:id', authMiddleware, deleteQuestion);
router.post('/questions/:questionId/answers', authMiddleware, postAnswer);
router.put('/answers/:id', authMiddleware, updateAnswer);
router.delete('/answers/:id', authMiddleware, deleteAnswer);

export default router;