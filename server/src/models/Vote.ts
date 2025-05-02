import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { Question } from './Question';
import { Answer } from './Answer';

@Table({
  tableName: 'votes',
  timestamps: true
})
export class Vote extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: v4()
  })
  declare id: string;

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

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[-1, 1]] // -1 for downvote, 1 for upvote
    }
  })
  declare value: number;

}