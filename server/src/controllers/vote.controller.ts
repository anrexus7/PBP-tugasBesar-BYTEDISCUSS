import { Request, Response } from 'express';
import { Vote } from '../models/Vote';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';
import { User } from '../models/User';
import { v4 as uuidv4 } from 'uuid';

export const voteQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const { value } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
      return 
    }

    // Validate vote value
    if (value !== 1 && value !== -1) {
        res.status(400).json({ error: 'Invalid vote value. Must be 1 (upvote) or -1 (downvote)' });
      return 
    }

    // Check if question exists
    const question = await Question.findByPk(questionId);
    if (!question) {
        res.status(404).json({ error: 'Question not found' });
      return 
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
            { model: User },
            { model: Vote, as: 'votes' },
            { 
              model: Answer, 
              as: 'answers',
              include: [User]
            }
          ]
        });
        console.log('updatedQuestion', updatedQuestion);
         // Return updated question with votes
        res.json(updatedQuestion);
        return 
      } else {
        // If different vote, update it
        await existingVote.update({ value });
        
        const updatedQuestion = await Question.findByPk(questionId, {
          include: [
            { model: User },
            { model: Vote, as: 'votes' },
            { 
              model: Answer, 
              as: 'answers',
              include: [User]
            }
          ]
        });
        console.log('updatedQuestion 2', updatedQuestion);
         // Return updated question with votes
        res.json(updatedQuestion);
        return 
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
        { model: User },
        { model: Vote, as: 'votes' },
        { 
          model: Answer, 
          as: 'answers',
          include: [User]
        }
      ]
    });
    console.log('updatedQuestion 3', updatedQuestion);
     // Return updated question with votes
    res.status(201).json(updatedQuestion);
  } catch (err) {
    console.error('Error voting on question:', err);
    res.status(500).json({ error: 'Failed to process vote' });
  }
};

export const voteAnswer = async (req: Request, res: Response) => {
  try {
    const { answerId } = req.params;
    const { value } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
      return 
    }

    // Validate vote value
    if (value !== 1 && value !== -1) {
        res.status(400).json({ error: 'Invalid vote value. Must be 1 (upvote) or -1 (downvote)' });
      return 
    }

    // Check if answer exists
    const answer = await Answer.findByPk(answerId);
    if (!answer) {
        res.status(404).json({ error: 'Answer not found' });
      return 
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({
      where: {
        userId,
        answerId
      }
    });
    console.log('a',existingVote);
    if (existingVote) {
      // If same vote, remove it
      if (existingVote.value === value) {
        await existingVote.destroy();
        
        const updatedAnswer = await Answer.findByPk(answerId, {
          include: [
            User,
            { model: Vote, as: 'votes' }
          ]
        });
        console.log('b',updatedAnswer);
        res.json(updatedAnswer);
        return 
      } else {
        // If different vote, update it
        await existingVote.update({ value });
        
        const updatedAnswer = await Answer.findByPk(answerId, {
          include: [
            User,
            { model: Vote, as: 'votes' }
          ]
        });
        console.log('c',updatedAnswer);
        res.json(updatedAnswer);
        return 
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
        User,
        { model: Vote, as: 'votes' }
      ]
    });
    console.log('d',updatedAnswer);
    res.status(201).json(updatedAnswer);
  } catch (err) {
    console.error('Error voting on answer:', err);
    res.status(500).json({ error: 'Failed to process vote' });
  }
};

export const getUserVote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Ambil semua vote milik user
    const votes = await Vote.findAll({
      where: { userId },
      attributes: ['questionId', 'answerId', 'value']
    });

    res.json({ votes });
  } catch (err) {
    console.error('Error getting user vote:', err);
    res.status(500).json({ error: 'Failed to get user vote' });
  }
};