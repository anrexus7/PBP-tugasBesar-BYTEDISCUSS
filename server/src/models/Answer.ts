import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from './User';
import { Question } from './Question';
import { Comment } from './Comment';
import { Vote } from './Vote';
import { v4 } from 'uuid';

@Table({
  tableName: 'answers',
  timestamps: true
})
export class Answer extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: v4()
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
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => Question)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'questionId'
  })
  declare questionId: number;

  @BelongsTo(() => Question)
  declare question: Question;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'isAccepted'
  })
  declare isAccepted: boolean;

  @HasMany(() => Comment)
  declare comments: Comment[];

  @HasMany(() => Vote)
  declare votes: Vote[];
}