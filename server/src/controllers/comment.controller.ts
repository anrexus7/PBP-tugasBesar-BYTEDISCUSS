import { Request, Response } from 'express';
import { Comment } from '../models/Comment';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';
import { User } from '../models/User';

export const createComment = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.userId;
    const { content, questionId, answerId, parentCommentId } = req.body;

    // Validate input
    if (!content) {
      res.status(400).json({ message: 'Content is required' });
      return 
    }

    // Check if commenting on question, answer, or another comment
    const commentable = await getCommentableEntity(questionId, answerId, parentCommentId);
    if (!commentable.exists) {
      res.status(400).json({ message: commentable.message });
      return 
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
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
    return 
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.userId;
    const { id } = req.params;
    const { content } = req.body;

    // Validate input
    if (!content) {
      res.status(400).json({ message: 'Content is required' });
      return 
    }

    // Find comment
    const comment = await Comment.findOne({
      where: { id, userId }
    });

    if (!comment) {
      res.status(404).json({ message: 'Comment not found or unauthorized' });
      return 
    }

    // Update comment
    comment.content = content;
    await comment.save();

    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.userId;
    const { id } = req.params;

    // Find comment
    const comment = await Comment.findOne({
      where: { id, userId }
    });

    if (!comment) {
      res.status(404).json({ message: 'Comment not found or unauthorized' });
      return 
    }

    // Delete comment
    await comment.destroy();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// export const getComments = async (req: Request, res: Response) => {
//   try {
//     const { questionId, answerId } = req.query;

//     let whereCondition = {};
//     if (questionId) {
//       whereCondition = { questionId };
//     } else if (answerId) {
//       whereCondition = { answerId };
//     } else {
//       res.status(400).json({ message: 'Either questionId or answerId is required' });
//       return 
//     }

//     const comments = await Comment.findAll({
//       where: {
//         ...whereCondition,
//         parentCommentId: null // Only get top-level comments
//       },
//       include: [
//         {
//           model: User,
//           attributes: ['id', 'username', 'profilePicture']
//         },
//         {
//           model: Comment,
//           as: 'replies',
//           include: [
//             {
//               model: User,
//               attributes: ['id', 'username', 'profilePicture']
//             }
//           ]
//         }
//       ],
//       order: [
//         ['createdAt', 'DESC'],
//         [{ model: Comment, as: 'replies' }, 'createdAt', 'ASC']
//       ]
//     });

//     res.json(comments);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

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

export const createQuestionComment = async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { id } = req.params;
      const { content, parentCommentId } = req.body;
  
      if (!content) {
        res.status(400).json({ message: 'Content is required' });
        return 
      }
  
      const question = await Question.findByPk(id);
      if (!question) {
        res.status(404).json({ message: 'Question not found' });
        return 
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
          res.status(400).json({ message: 'Invalid parent comment' });
          return 
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
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
// export const createAnswerComment = async (req: Request, res: Response) => {
//   try {
//     // @ts-ignore
//     const userId = req.userId;
//     const { id } = req.params;
//     const { content, parentCommentId } = req.body;

//     if (!content) {
//       res.status(400).json({ message: 'Content is required' });
//       return 
//     }

//     const answer = await Answer.findByPk(id);
//     if (!answer) {
//       res.status(404).json({ message: 'Answer not found' });
//       return 
//     }

//     // Check if parent comment exists and belongs to this answer
//     if (parentCommentId) {
//       const parentComment = await Comment.findOne({
//         where: { 
//           id: parentCommentId,
//           answerId: id 
//         }
//       });
      
//       if (!parentComment) {
//         res.status(400).json({ message: 'Invalid parent comment' });
//         return 
//       }
//     }

//     const comment = await Comment.create({
//       content,
//       userId,
//       answerId: id,
//       parentCommentId: parentCommentId || null
//     });

//     const commentWithUser = await Comment.findByPk(comment.id, {
//       include: [{
//         model: User,
//         attributes: ['id', 'username', 'profilePicture']
//       }]
//     });

//     res.status(201).json(commentWithUser);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


export const createAnswerComment = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.userId;
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ message: 'Content is required' });
      return 
    }

    const answer = await Answer.findByPk(id);

    if (!answer) {
      res.status(404).json({ message: 'Answer not found' });
      return 
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
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
    return 
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const { questionId, answerId } = req.query;

    // Validate input
    if (!questionId && !answerId) {
      res.status(400).json({ message: 'Either questionId or answerId is required' });
      return 
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

    res.json(comments);
    return 
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ message: 'Failed to get comments' });
    return 
  }
};