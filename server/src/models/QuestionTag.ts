import { Table, Column, Model, DataType, ForeignKey, PrimaryKey } from 'sequelize-typescript';
import { Question } from './Question';
import { Tag } from './Tag';

@Table({
  tableName: 'question_tags',
  timestamps: false,
  paranoid: true,
})
export class QuestionTag extends Model {
  @PrimaryKey
  @ForeignKey(() => Question)
  @Column({
    type: DataType.UUID,
    field: 'questionId'
  })
  declare questionId: string;

  @PrimaryKey
  @ForeignKey(() => Tag)
  @Column({
    type: DataType.UUID,
    field: 'tagId'
  })
  declare tagId: string;
}