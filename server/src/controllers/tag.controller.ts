import { Request, Response } from 'express';
import { Tag } from '../models/Tag';
import { Question } from '../models/Question';
import { User } from '../models/User';

export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await Tag.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    res.json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.userId;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Tag name is required' });
      return;
    }

    const normalizedTagName = name.trim().toLowerCase();

    const [tag, created] = await Tag.findOrCreate({
      where: { name: normalizedTagName },
      defaults: { name: normalizedTagName }
    });

    if (!created) {
      res.status(400).json({ message: 'Tag already exists' });
      return;
    }

    res.status(201).json(tag);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTagById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findByPk(id, {
      include: [
        {
          model: Question,
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'profilePicture']
            },
            {
              model: Tag,
              through: { attributes: [] }
            }
          ],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!tag) {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }

    res.json(tag);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};