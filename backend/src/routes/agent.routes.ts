import { Router } from 'express';
import { AgentController } from '../controllers/agent.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, AgentController.list);
router.get('/:role', authMiddleware, AgentController.getByRole);
router.post('/reset', authMiddleware, AgentController.reset);

export default router;
