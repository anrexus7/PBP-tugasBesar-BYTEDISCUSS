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
    const userId = (req as any).userId;
    const names: string[] = req.body.name; // Changed to accept array of tag names
    console.log('\n\n\n\nReceived tag names:', names);

    console.log("Request body:", req.body);

    if (!names || !Array.isArray(names) || names.length === 0) {
      res.status(400).json({ message: 'Tag names are required as an array' });
      return;
    }

    // Process each tag name
    const normalizedTagNames = names.map(name => name.trim().toLowerCase());
    const uniqueTagNames = [...new Set(normalizedTagNames)]; // Ensure uniqueness

    // Find existing tags
    const existingTags = await Tag.findAll({
      where: { name: uniqueTagNames }
    });

    const existingTagNames = existingTags.map(tag => tag.name);
    const newTagNames = uniqueTagNames.filter(name => !existingTagNames.includes(name));

    // Create new tags
    const createdTags = await Promise.all(
      newTagNames.map(name => 
        Tag.create({ 
          name,
          userId // Associate tag with user who created it
        })
      )
    );

    // Combine existing and new tags
    const allTags = [...existingTags, ...createdTags];

    res.status(201).json(allTags);
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