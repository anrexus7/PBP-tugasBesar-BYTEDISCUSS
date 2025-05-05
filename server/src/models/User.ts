import { Table, Column, Model, DataType, HasMany, BeforeCreate } from 'sequelize-typescript';
import { Question } from './Question';
import { Answer } from './Answer';
import { Comment } from './Comment';
import { Vote } from './Vote';
import bcrypt from 'bcrypt';
import { v4 } from 'uuid';

@Table({
  tableName: 'users',
  timestamps: true
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: v4(),
    allowNull: false
  })
  declare id: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true
  })
  declare username: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'passwordHash'
  })
  declare passwordHash: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: 'profilePicture'
  })
  declare profilePicture: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  declare bio: string | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0
  })
  declare reputation: number;

  @HasMany(() => Question)
  declare questions: Question[];

  @HasMany(() => Answer)
  declare answers: Answer[];

  @HasMany(() => Comment)
  declare comments: Comment[];

  @HasMany(() => Vote)
  declare votes: Vote[];

  @BeforeCreate
  static async hashPassword(user: User) {
    if (user.passwordHash) {
      user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }
}