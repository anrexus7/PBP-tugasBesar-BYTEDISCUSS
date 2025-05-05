import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { Question } from './Question';
import { Answer } from './Answer';
import { v4 } from 'uuid';

@Table({
  tableName: 'comments',
  timestamps: true
})
export class Comment extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: v4(),
    allowNull : false,
  })
  declare id: string;

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

  @ForeignKey(() => Question)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'questionId'
  })
  declare questionId: string | null;

  @BelongsTo(() => Question)
  declare question: Question | null;

  @ForeignKey(() => Answer)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'answerId'
  })
  declare answerId: string | null;

  @BelongsTo(() => Answer)
  declare answer: Answer | null;

}