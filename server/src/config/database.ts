import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/User';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';
import { Comment } from '../models/Comment';
import { Tag } from '../models/Tag';
import { QuestionTag } from '../models/QuestionTag';
import { Vote } from '../models/Vote';

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'bytediscuss',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  models: [User, Question, Answer, Comment, Tag, QuestionTag, Vote],
  logging: false,
  define: {
    timestamps: false
  }
});

export default sequelize;