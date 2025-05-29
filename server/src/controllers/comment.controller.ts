import { Request, Response, NextFunction } from 'express';
import { Comment } from '../models/Comment';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';
import { User } from '../models/User';
import { controllerWrapper } from './wrapper.controller';
import { ApiError } from '../middlewares/errorHandler.middleware';

export const createComment = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const userId = req.userId;
  const { content, questionId, answerId, parentCommentId } = req.body;

  // Validate input
  if (!content) {
    return next(new ApiError(400, 'Comment content is required'));
  }

  // Check if commenting on question, answer, or another comment
  const commentable = await getCommentableEntity(questionId, answerId, parentCommentId);
  if (!commentable.exists) {
    return next(new ApiError(400, commentable.message));
  }

  // Create comment
  const comment = await Comment.create({
    content,
    userId,
    questionId: questionId || null,
    answerId: answerId || null,
    parentCommentId: parentCommentId || null
  });

  // Populate user data
  const commentWithUser = await Comment.findByPk(comment.id, {
    include: [{
      model: User,
      attributes: ['id', 'username', 'profilePicture']
    }]
  });

  res.status(201).json(commentWithUser);
});

export const updateComment = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const userId = req.userId;
  const { id } = req.params;
  const { content } = req.body;

  // Validate input
  if (!content) {
    return next(new ApiError(400, 'Updated comment content is required'));
  }

  // Find comment
  const comment = await Comment.findOne({
    where: { id, userId }
  });

  if (!comment) {
    return next(new ApiError(404, 'Comment not found or you are unauthorized to update this comment'));
  }

  // Check if user is the owner of the comment
  if (comment.userId !== userId) {
    res.status(403).json({ message: 'You are not authorized to edit this comment' });
    return;
  }

  // Update comment
  comment.content = content;
  await comment.save();

  const updatedComment = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        attributes: ['id', 'username', 'profilePicture']
      }]
    });

    res.json(updatedComment);
});

export const deleteComment = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const userId = req.userId;
  const { id } = req.params;

  // Find comment
  const comment = await Comment.findOne({
    where: { id, userId }
  });

  if (!comment) {
    return next(new ApiError(404, 'Comment not found or you are unauthorized to delete this comment'));
  }

  // Check if user is the owner of the comment
    if (comment.userId !== userId) {
      res.status(403).json({ message: 'You are not authorized to delete this comment' });
      return;
    }

  // Delete comment
  await comment.destroy();

  res.status(200).json({ message: 'Comment deleted successfully' });
});

export const createQuestionComment = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const userId = req.userId;
  const { id } = req.params;
  const { content, parentCommentId } = req.body;

  if (!content) {
    return next(new ApiError(400, 'Question comment content is required'));
  }

  const question = await Question.findByPk(id);
  if (!question) {
    return next(new ApiError(404, 'Question not found for commenting'));
  }

  // Check if parent comment exists and belongs to this question
  if (parentCommentId) {
    const parentComment = await Comment.findOne({
      where: { 
        id: parentCommentId,
        questionId: id 
      }
    });
    
    if (!parentComment) {
      return next(new ApiError(400, 'Parent comment not found or does not belong to this question'));
    }
  }

  const comment = await Comment.create({
    content,
    userId,
    questionId: id,
    parentCommentId: parentCommentId || null
  });

  const commentWithUser = await Comment.findByPk(comment.id, {
    include: [{
      model: User,
      attributes: ['id', 'username', 'profilePicture']
    }]
  });

  res.status(201).json(commentWithUser);
});

export const createAnswerComment = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const userId = req.userId;
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return next(new ApiError(400, 'Answer comment content is required'));
  }

  const answer = await Answer.findByPk(id);

  if (!answer) {
    return next(new ApiError(404, 'Answer not found for commenting'));
  }

  const comment = await Comment.create({
    content,
    userId,
    answerId: id
  });

  const commentWithUser = await Comment.findByPk(comment.id, {
    include: [{
      model: User,
      attributes: ['id', 'username', 'profilePicture']
    }]
  });

  res.status(201).json(commentWithUser);
});

export const getComments = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { questionId, answerId } = req.query;

  // Validate input
  if (!questionId && !answerId) {
    return next(new ApiError(400, 'Either questionId or answerId is required to fetch comments'));
  }

  const whereCondition: any = {};
  if (questionId) whereCondition.questionId = questionId;
  if (answerId) whereCondition.answerId = answerId;
  const comments = await Comment.findAll({
    where: whereCondition,
    include: [{
      model: User,
      attributes: ['id', 'username', 'profilePicture']
    }],
    order: [['createdAt', 'ASC']]
  });

  res.status(200).json(comments);
});

// Helper function to validate commentable entity
async function getCommentableEntity(questionId: number, answerId: number, parentCommentId: number) {
  if (questionId) {
    const question = await Question.findByPk(questionId);
    return {
      exists: !!question,
      message: 'Question not found'
    };
  }

  if (answerId) {
    const answer = await Answer.findByPk(answerId);
    return {
      exists: !!answer,
      message: 'Answer not found'
    };
  }

  if (parentCommentId) {
    const parentComment = await Comment.findByPk(parentCommentId);
    return {
      exists: !!parentComment,
      message: 'Parent comment not found'
    };
  }

  return {
    exists: false,
    message: 'Either questionId, answerId, or parentCommentId is required'
  };
}