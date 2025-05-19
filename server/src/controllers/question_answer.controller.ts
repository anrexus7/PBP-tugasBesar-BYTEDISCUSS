import { Request, Response } from 'express';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';
import { User } from '../models/User';
import { Tag } from '../models/Tag';
import { v4 as uuidv4 } from 'uuid';

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
        { model: Tag },
        {
          model: Answer,
          as: 'answers',
          attributes: ['id', 'content', 'isAccepted'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(questions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Gagal mengambil data pertanyaan.' });
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
    }

    res.json(question);
  } catch (err) {
    console.error('Error fetching question by id:', err);
    res.status(500).json({ error: 'Gagal mengambil detail pertanyaan.' });
  }
};

// POST /questions
export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const userId = (req as any).userId;
    console.log('User ID:', userId);

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { title, content } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'Data tidak lengkap.' });
      return;
    }

    const question = await Question.create({
      title,
      content,
      userId,
    } as any);


    const questionWithRelations = await Question.findByPk(question.id, {
      include: [
        { model: User },
        { model: Tag },
        { model: Answer, as: 'answers', attributes: ['id', 'content', 'isAccepted'] }
      ],
    });

    res.status(201).json(questionWithRelations);
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).json({ error: 'Gagal membuat pertanyaan baru.' });
  }
};


// PUT /questions/:id
export const updateQuestion = async (req: Request, res: Response) : Promise<void> =>  {
  try {
    const { title, content } = req.body;
    const question = await Question.findByPk(req.params.id);
    
    if (question) {
      await question.update({ title, content });
  
      const updatedQuestion = await Question.findByPk(question.id, {
        include: [User, Tag]
      });
  
      res.json(updatedQuestion);
    }
    res.status(404).json({ error: 'Pertanyaan tidak ditemukan.' });
      
  } catch (err) {
    console.error('Error updating question:', err);
    res.status(500).json({ error: 'Gagal memperbarui pertanyaan.' });
  }
};

// DELETE /questions/:id
export const deleteQuestion = async (req: Request, res: Response)  : Promise<void> =>  {
  try {
    const question = await Question.findByPk(req.params.id);

    if (question) {
      await question.destroy();
      res.json({ message: 'Pertanyaan berhasil dihapus.' });
    }
    res.status(404).json({ error: 'Pertanyaan tidak ditemukan.' });

  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ error: 'Gagal menghapus pertanyaan.' });
  }
};

// POST /questions/:questionId/answers
export const postAnswer = async (req: Request, res: Response) : Promise<void> =>  {
  try {
    const { content, userId } = req.body;
    const { questionId } = req.params;

    if (!content || !userId) {
      res.status(400).json({ error: 'Data tidak lengkap.' });
    }

    const answer = await Answer.create({
      content,
      userId,
      questionId,
      isAccepted: false
    });

    const answerWithUser = await Answer.findByPk(answer.id, {
      include: [User]
    });

    res.status(201).json(answerWithUser);
  } catch (err) {
    console.error('Error posting answer:', err);
    res.status(500).json({ error: 'Gagal mengirim jawaban.' });
  }
};

// PUT /answers/:id
export const updateAnswer = async (req: Request, res: Response)  : Promise<void> =>  {
  try {
    const { content } = req.body;
    const answer = await Answer.findByPk(req.params.id);

    if (answer) {
      await answer.update({ content });
  
      const updatedAnswer = await Answer.findByPk(answer.id, {
        include: [User]
      });
  
      res.json(updatedAnswer);
    }
    res.status(404).json({ error: 'Jawaban tidak ditemukan.' });

  } catch (err) {
    console.error('Error updating answer:', err);
    res.status(500).json({ error: 'Gagal memperbarui jawaban.' });
  }
};

// DELETE /answers/:id
export const deleteAnswer = async (req: Request, res: Response)  : Promise<void> =>  {
  try {
    const answer = await Answer.findByPk(req.params.id);

    if (answer) {
      await answer.destroy();
      res.json({ message: 'Jawaban berhasil dihapus.' });
    }
    res.status(404).json({ error: 'Jawaban tidak ditemukan.' });

  } catch (err) {
    console.error('Error deleting answer:', err);
    res.status(500).json({ error: 'Gagal menghapus jawaban.' });
  }
};
