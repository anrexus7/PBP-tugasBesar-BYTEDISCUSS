import { Request, Response, NextFunction } from 'express';
import { Question } from '../models/Question';
import { User } from '../models/User';
import { Tag } from '../models/Tag';
import { Vote } from '../models/Vote';
import { Answer } from '../models/Answer';
import { Op } from 'sequelize';
import { controllerWrapper } from './wrapper.controller';
import { ApiError } from '../middlewares/errorHandler.middleware';

export const searchContent = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { q: query } = req.query;

  if (!query || typeof query !== 'string') {
    return next(new ApiError(400, 'Search query is required'));
  }

  // Extract filter tokens
  const userMatch = query.match(/user:\s*(\S+)/);
  const scoreMatch = query.match(/score:\s*(\d+)/);

  // If no special filter, treat the query as title text
  const defaultTitleSearch = !userMatch && !scoreMatch ? query : null;

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
    },
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
  ];

  let questions = await Question.findAll({
    where: whereClause,
    include: includeClause,
    order: [['createdAt', 'DESC']]
  });
  
  if (scoreMatch) {
    const minScore = parseInt(scoreMatch[1], 10);
    questions = questions.filter((question) => {
      const totalVotes = question.votes?.reduce((sum, vote) => sum + vote.value, 0) || 0;
      return totalVotes >= minScore;
    });
  }

  // Format questions to include tag names, voteCount, answerCount
  const formattedQuestions = (questions as any[]).map((question: any) => {
    const questionJson = question.toJSON();
    return {
      ...questionJson,
      tags: questionJson.tags?.map((tag: any) => tag.name) || [],
      voteCount: questionJson.votes?.reduce((sum: number, vote: any) => sum + vote.value, 0) || 0,
      answerCount: questionJson.answers?.length || 0
    };
  });

  res.status(200).json(formattedQuestions);
});
