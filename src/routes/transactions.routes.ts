import { Router } from 'express';
import { transactionsController } from '../controllers/transactions.controller';

const router = Router();

/**
 * Transaction history routes
 */

// Get all transactions for a specific goal
router.get('/goals/:goalId/transactions', (req, res) =>
  transactionsController.getGoalTransactions(req, res)
);

// Get all transactions for a user (across all goals)
router.get('/users/:address/transactions', (req, res) =>
  transactionsController.getUserTransactions(req, res)
);

export default router;
