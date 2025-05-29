import { Request, Response, NextFunction } from 'express';
import { Vote } from '../models/Vote';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';
import { User } from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import { controllerWrapper } from './wrapper.controller';
import { ApiError } from '../middlewares/errorHandler.middleware';

export const voteQuestion = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { questionId } = req.params;
  const { value } = req.body;
  const userId = (req as any).userId;
  if (!userId) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  // Validate vote value
  if (value !== 1 && value !== -1 && value !== 0) {
    return next(new ApiError(400, 'Invalid vote value. Must be 1 (upvote), -1 (downvote), or 0 (remove vote)'));
  }

  // Check if question exists
  const question = await Question.findByPk(questionId);
  if (!question) {
    return next(new ApiError(404, 'Question not found'));
  }

  // Check if user already voted
  const existingVote = await Vote.findOne({
    where: {
      userId,
      questionId
    }
  });
  console.log('existingVote', existingVote);
  
  if (existingVote) {
    // If same vote, remove it
    if (existingVote.value === value) {
      await existingVote.destroy();
      
      // Update question vote count
      const updatedQuestion = await Question.findByPk(questionId, {
        include: [
          { model: User, attributes: ['id', 'username', 'profilePicture'] },
          { model: Vote, as: 'votes' },
          { 
            model: Answer, 
            as: 'answers',
            include: [{ model: User, attributes: ['id', 'username', 'profilePicture'] }]
          }
        ]
      });
      console.log('updatedQuestion', updatedQuestion);
      // Return updated question with votes
      res.status(200).json(updatedQuestion);
      return;
    } else {
      // If different vote, update it
      await existingVote.update({ value });
      
      const updatedQuestion = await Question.findByPk(questionId, {
        include: [
          { model: User, attributes: ['id', 'username', 'profilePicture'] },
          { model: Vote, as: 'votes' },
          { 
            model: Answer, 
            as: 'answers',
            include: [{ model: User, attributes: ['id', 'username', 'profilePicture'] }]
          }
        ]
      });
      console.log('updatedQuestion 2', updatedQuestion);
      // Return updated question with votes
      res.status(200).json(updatedQuestion);
      return;
    }
  }

  // Create new vote
  const vote = await Vote.create({
    id: uuidv4(),
    userId,
    questionId,
    value
  });
  
  const updatedQuestion = await Question.findByPk(questionId, {
    include: [
      { model: User, attributes: ['id', 'username', 'profilePicture'] },
      { model: Vote, as: 'votes' },
      { 
        model: Answer, 
        as: 'answers',
        include: [{ model: User, attributes: ['id', 'username', 'profilePicture'] }]
      }
    ]
  });
  console.log('updatedQuestion 3', updatedQuestion);
  // Return updated question with votes
  res.status(200).json(updatedQuestion);
});

export const voteAnswer = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { answerId } = req.params;
  const { value } = req.body;
  const userId = (req as any).userId;
  if (!userId) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  // Validate vote value
  if (value !== 1 && value !== -1 && value !== 0) {
    return next(new ApiError(400, 'Invalid vote value. Must be 1 (upvote), -1 (downvote), or 0 (remove vote)'));
  }

  // Check if answer exists
  const answer = await Answer.findByPk(answerId);
  if (!answer) {
    return next(new ApiError(404, 'Answer not found'));
  }

  // Check if user already voted
  const existingVote = await Vote.findOne({
    where: {
      userId,
      answerId
    }
  });
  console.log('a', existingVote);
  
  if (existingVote) {
    // If same vote, remove it
    if (existingVote.value === value) {
      await existingVote.destroy();
      
      const updatedAnswer = await Answer.findByPk(answerId, {
        include: [
          { model: User, attributes: ['id', 'username', 'profilePicture'] },
          { model: Vote, as: 'votes' }
        ]
      });
      console.log('b', updatedAnswer);
      res.status(200).json(updatedAnswer);
      return;
    } else {
      // If different vote, update it
      await existingVote.update({ value });
      
      const updatedAnswer = await Answer.findByPk(answerId, {
        include: [
          { model: User, attributes: ['id', 'username', 'profilePicture'] },
          { model: Vote, as: 'votes' }
        ]
      });
      console.log('c', updatedAnswer);
      res.status(200).json(updatedAnswer);
      return;
    }
  }

  // Create new vote
  const vote = await Vote.create({
    id: uuidv4(),
    userId,
    answerId,
    value
  });

  const updatedAnswer = await Answer.findByPk(answerId, {
    include: [
      { model: User, attributes: ['id', 'username', 'profilePicture'] },
      { model: Vote, as: 'votes' }
    ]
  });
  console.log('d', updatedAnswer);
  res.status(200).json(updatedAnswer);
});

export const getUserVote = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).userId;
    if (!userId) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  // Ambil semua vote milik user
  const votes = await Vote.findAll({
    where: { userId },
    attributes: ['questionId', 'answerId', 'value']
  });

  res.status(200).json({ votes });
});