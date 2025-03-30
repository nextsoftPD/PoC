import { Router } from 'express';
import { analyzeRequirement } from '../controllers/ollamaController';


const router = Router();

router.post('/analyzeRequirement', analyzeRequirement);

export default router;
