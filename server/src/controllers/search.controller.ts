import { Request, Response } from 'express';
import { Question } from '../models/Question';
import { User } from '../models/User';
import { Tag } from '../models/Tag';
import { Vote } from '../models/Vote';
import { Op } from 'sequelize';

export const searchContent = async (req: Request, res: Response) => {
  try {
    const { q: query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Extract filter tokens
    const userMatch = query.match(/user:\s*(\S+)/);
    const tagMatch = query.match(/\[(\w+)\]/);
    const scoreMatch = query.match(/score:\s*(\d+)/);

    // If no special filter, treat the query as title text
    const defaultTitleSearch = !userMatch && !tagMatch && !scoreMatch ? query : null;

    const whereClause: any = {};
    if (defaultTitleSearch) {
      whereClause.title = { [Op.like]: `%${defaultTitleSearch}%` };
    }

    // Build include clause
    const includeClause: any[] = [
      {
        model: User,
        attributes: ['id', 'username', 'profilePicture'],
        ...(userMatch && {
          where: { username: { [Op.like]: `%${userMatch[1]}%` } }
        })
      },
      {
        model: Tag,
        through: { attributes: [] },
        ...(tagMatch && {
          where: { name: { [Op.like]: `%${tagMatch[1]}%` } }
        })
      },
      {
        model: Vote
      }
    ];

    // Query with filters applied in DB
    let questions = await Question.findAll({
      where: whereClause,
      include: includeClause,
      order: [['createdAt', 'DESC']]
    });

    // Score filtering in memory
    if (scoreMatch) {
      const minScore = parseInt(scoreMatch[1], 10);
      questions = questions.filter((question) => {
        const totalVotes = question.votes?.reduce((sum, vote) => sum + vote.value, 0) || 0;
        return totalVotes >= minScore;
      });
    }


    res.json({ questions});
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
