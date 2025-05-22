import express from 'express';
import { voteQuestion, voteAnswer, getUserVote } from '../controllers/vote.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/questions/:questionId/vote', authMiddleware, voteQuestion);
router.post('/answers/:answerId/vote', authMiddleware, voteAnswer);
router.get('/votes', authMiddleware, getUserVote);

export default router;