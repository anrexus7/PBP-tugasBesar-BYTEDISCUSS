import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/User';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';
import { Comment } from '../models/Comment';
import { Tag } from '../models/Tag';
import { QuestionTag } from '../models/QuestionTag';
import { Vote } from '../models/Vote';
import { Session } from '../models/Session';

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'stackoverflow_clone',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  models: [User, Question, Answer, Comment, Tag, QuestionTag, Vote, Session],
  logging: false,
  define: {
    timestamps: false // We handle timestamps manually in our models
  }
});

export default sequelize;