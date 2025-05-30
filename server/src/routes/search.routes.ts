import { Router } from 'express';
import { searchContent } from '../controllers/search.controller';

const router = Router();

// @ts-ignore
router.get('/', searchContent);

export default router;