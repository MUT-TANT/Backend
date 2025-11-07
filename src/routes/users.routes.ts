import { Router } from 'express';
import { goalsController } from '../controllers/goals.controller';

const router = Router();

/**
 * User-specific routes
 */

// Get all goals for a user
router.get('/:address/goals', (req, res) => goalsController.getUserGoals(req, res));

export default router;
