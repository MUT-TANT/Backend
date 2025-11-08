import { Router } from 'express';
import { goalsController } from '../controllers/goals.controller';

const router = Router();

/**
 * User-specific routes
 */

// Get all goals for a user
router.get('/:address/goals', (req, res) => goalsController.getUserGoals(req, res));

// Get user's portfolio (wallet balances + goals summary)
router.get('/:address/portfolio', (req, res) => goalsController.getUserPortfolio(req, res));

export default router;
