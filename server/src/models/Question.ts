import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, BelongsToMany } from 'sequelize-typescript';
import { User } from './User';
import { Answer } from './Answer';
import { Comment } from './Comment';
import { Vote } from './Vote';
import { Tag } from './Tag';
import { QuestionTag } from './QuestionTag';
import { v4 } from 'uuid';

@Table({
  tableName: 'questions',
  timestamps: true
})
export class Question extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: v4(),
    allowNull : false,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare content: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'userId'
  })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'viewCount'
  })
  declare viewCount: number;

  @HasMany(() => Answer)
  declare answers: Answer[];
  
  @HasMany(() => Comment)
  declare comments: Comment[];

  @HasMany(() => Vote)
  declare votes: Vote[];

  @HasMany(() => QuestionTag)
  declare questionTags: QuestionTag[];

  @BelongsToMany(() => Tag, () => QuestionTag)
  declare tags: Tag[];
}