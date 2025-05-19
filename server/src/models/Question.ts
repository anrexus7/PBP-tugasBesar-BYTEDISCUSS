import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  BelongsToMany,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { v4 } from 'uuid';
import { User } from './User';
import { Answer } from './Answer';
import { Comment } from './Comment';
import { Vote } from './Vote';
import { Tag } from './Tag';
import { QuestionTag } from './QuestionTag';

@Table({
  tableName: 'questions',
  timestamps: true,
})
export class Question extends Model<Question> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: () => v4(),
    allowNull: false,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare content: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'userId',
  })
  declare userId: string;

  @BelongsTo(() => User, 'userId')
  declare user: User;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'viewCount',
  })
  declare viewCount: number;

  @HasMany(() => Answer, { foreignKey: 'questionId', as: 'answers' })
  declare answers: Answer[];

  @HasMany(() => Comment, { foreignKey: 'questionId' })
  declare comments: Comment[];

  @HasMany(() => Vote, { foreignKey: 'questionId' })
  declare votes: Vote[];

  @HasMany(() => QuestionTag, { foreignKey: 'questionId' })
  declare questionTags: QuestionTag[];

  @BelongsToMany(() => Tag, () => QuestionTag)
  declare tags: Tag[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
