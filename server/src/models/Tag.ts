import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { QuestionTag } from './QuestionTag';
import { v4 } from 'uuid';

@Table({
  tableName: 'tags',
  timestamps: false,
  paranoid: true,
})
export class Tag extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: v4(),
    allowNull : false,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true
  })
  declare name: string;

  @HasMany(() => QuestionTag)
  declare questionTags: QuestionTag[];
}