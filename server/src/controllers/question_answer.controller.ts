import { Request, Response } from 'express';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';
import { User } from '../models/User';
import { Tag } from '../models/Tag';
import { v4 as uuidv4 } from 'uuid';
import { Vote } from '../models/Vote';
import { QuestionTag } from '../models/QuestionTag';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; [key: string]: any };
    }
  }
}


// GET /questions
export const getAllQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await Question.findAll({
      include: [
        { model: User },
        { model: Tag, through: { attributes: [] } },
        {
          model: Answer,
          as: 'answers',
          attributes: ['id', 'content', 'isAccepted'],
        },
        {
          model: Vote,
          as: 'votes',
          attributes: ['id', 'value', 'userId']
        }
      ],
      order: [['createdAt', 'DESC']],
    });
    
    // Format questions to include tag names as an array
    const formattedQuestions = questions.map(question => {
      const questionJson = question.toJSON();
      return {
        ...questionJson,
        tags: questionJson.tags?.map((tag: any) => tag.name) || [],
        voteCount: questionJson.votes?.reduce((sum: number, vote: any) => sum + vote.value, 0) || 0,
        answerCount: questionJson.answers?.length || 0
      };
    });
    
    res.json(formattedQuestions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Failed to fetch questions.' });
  }
};

// GET /questions/:id
export const getQuestionById = async (req: Request, res: Response) : Promise<void> =>  {
  try {
    const question = await Question.findByPk(req.params.id, {
      include: [
        User,
        { model: Answer, include: [User] },
        Tag
      ]
    });

    if (!question) {
      res.status(404).json({ error: 'Pertanyaan tidak ditemukan.' });
      return;
    }

    // Increment viewCount if user is logged in
    const userId = (req as any).userId || (req.user && req.user.id);
    if (userId) {
      question.viewCount = (question.viewCount || 0) + 1;
      console.log('Incrementing view count for question:', question.id);
      await question.save();
    }

    res.json(question);
  } catch (err) {
    console.error('Error fetching question by id:', err);
    res.status(500).json({ error: 'Gagal mengambil detail pertanyaan.' });
  }
};

// POST /questions/new
export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { title, content, tags } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required.' });
      return;
    }

    // Create the question
    const question = await Question.create({
      title,
      content,
      userId,
    } as any);

    // Process tags
    if (tags && tags.length > 0) {
      // Find or create tags
      const tagInstances = await Promise.all(
        tags.map(async (tagName: string) => {
          const [tag] = await Tag.findOrCreate({
            where: { name: tagName.toLowerCase() },
            defaults: {
              id: uuidv4(),
              name: tagName.toLowerCase(),
            }
          });
          return tag;
        })
      );

      // Associate tags with question
      await Promise.all(
        tagInstances.map(tag => 
          QuestionTag.create({
            questionId: question.id,
            tagId: tag.id
          })
        )
      );
    }

    const questionWithRelations = await Question.findByPk(question.id, {
      include: [
        { model: User },
        { model: Tag, through: { attributes: [] } },
        { 
          model: Answer, 
          as: 'answers', 
          attributes: ['id', 'content', 'isAccepted'] 
        }
      ],
    });

    res.status(201).json(questionWithRelations);
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).json({ error: 'Failed to create question.' });
  }
};


// PUT /questions/:id
export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { title, content, tags } = req.body;
    const question = await Question.findByPk(req.params.id, {
      include: [Tag]
    });
    
    if (!question) {
      res.status(404).json({ error: 'Question not found.' });
      return;
    }

    // Check if the user is the owner of the question
    if (question.userId !== userId) {
      res.status(403).json({ error: 'You are not authorized to edit this question.' });
      return;
    }

    // Update basic fields
    await question.update({ title, content });

    // Process tags if provided
    if (tags) {
      // Remove all existing tag associations
      await QuestionTag.destroy({ where: { questionId: question.id } });

      // Find or create new tags
      const tagInstances = await Promise.all(
        tags.map(async (tagName: string) => {
          const [tag] = await Tag.findOrCreate({
            where: { name: tagName.toLowerCase() },
            defaults: {
              id: uuidv4(),
              name: tagName.toLowerCase(),
            }
          });
          return tag;
        })
      );

      // Associate new tags with question
      await Promise.all(
        tagInstances.map(tag => 
          QuestionTag.create({
            questionId: question.id,
            tagId: tag.id
          })
        )
      );
    }

    const updatedQuestion = await Question.findByPk(question.id, {
      include: [
        User,
        { model: Tag, through: { attributes: [] } }
      ]
    });

    res.json(updatedQuestion);
  } catch (err) {
    console.error('Error updating question:', err);
    res.status(500).json({ error: 'Failed to update question.' });
  }
};

// DELETE /questions/:id
export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const question = await Question.findByPk(req.params.id);

    if (!question) {
      res.status(404).json({ error: 'Pertanyaan tidak ditemukan.' });
      return;
    }

    // Check if the user is the owner of the question
    if (question.userId !== userId) {
      res.status(403).json({ error: 'You are not authorized to delete this question.' });
      return;
    }

    await question.destroy();
    res.json({ message: 'Pertanyaan berhasil dihapus.' });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ error: 'Gagal menghapus pertanyaan.' });
  }
};

// POST /questions/:questionId/answers
export const postAnswer = async (req: Request, res: Response) : Promise<void> =>  {
  try {
    const { content } = req.body;
    const { questionId } = req.params;

    if (!content) {
      res.status(400).json({ error: 'Data tidak lengkap.' });
      return;
    }

    const userId = (req as any).userId;
    console.log('User ID:', userId);
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const answer = await Answer.create({ 
      id: uuidv4(),
      content, 
      userId, 
      questionId,
      isAccepted: false
     });
    const answerWithUser = await Answer.findByPk(answer.id, { include: [User] });

    res.status(201).json(answerWithUser);
  } catch (err) {
    console.error('Error posting answer:', err);
    res.status(500).json({ error: 'Gagal mengirim jawaban.' });
  }
};

// PUT /answers/:id
export const updateAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { content } = req.body;
    const answer = await Answer.findByPk(req.params.id);
    
    if (!answer) {
      res.status(404).json({ error: 'Jawaban tidak ditemukan.' });
      return;
    }

    // Check if the user is the owner of the answer
    if (answer.userId !== userId) {
      res.status(403).json({ error: 'You are not authorized to edit this answer.' });
      return;
    }

    await answer.update({ content });
    const updatedAnswer = await Answer.findByPk(answer.id, { include: [User] });
    res.json(updatedAnswer);
  } catch (err) {
    console.error('Error updating answer:', err);
    res.status(500).json({ error: 'Gagal memperbarui jawaban.' });
  }
};

// DELETE /answers/:id
export const deleteAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const answer = await Answer.findByPk(req.params.id);

    if (!answer) {
      res.status(404).json({ error: 'Jawaban tidak ditemukan.' });
      return;
    }

    // Check if the user is the owner of the answer
    if (answer.userId !== userId) {
      res.status(403).json({ error: 'You are not authorized to delete this answer.' });
      return;
    }

    await answer.destroy();
    res.json({ message: 'Jawaban berhasil dihapus.' });
  } catch (err) {
    console.error('Error deleting answer:', err);
    res.status(500).json({ error: 'Gagal menghapus jawaban.' });
  }
};
