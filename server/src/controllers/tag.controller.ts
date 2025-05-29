import { Request, Response, NextFunction } from 'express';
import { Tag } from '../models/Tag';
import { Question } from '../models/Question';
import { User } from '../models/User';
import { controllerWrapper } from './wrapper.controller';
import { ApiError } from '../middlewares/errorHandler.middleware';

export const getTags = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {  const tags = await Tag.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']]
  });

  res.status(200).json(tags);
});

export const createTag = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).userId;
  const names: string[] = req.body.name; // Changed to accept array of tag names
  // console.log('\n\n\n\nReceived tag names:', names);

  // console.log("Request body:", req.body);

  if (!names || !Array.isArray(names) || names.length === 0) {
    return next(new ApiError(400, 'Tag names must be provided as a non-empty array'));
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

  return res.status(201).json(allTags);
});

export const getTagById = controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
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
    return next(new ApiError(404, 'Tag not found with the provided ID'));
  }

  return res.status(200).json(tag);
});