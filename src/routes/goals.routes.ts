import { Router } from 'express';
import { goalsController } from '../controllers/goals.controller';

const router = Router();

/**
 * Goal management routes
 */

// Create a new savings goal
router.post('/', (req, res) => goalsController.createGoal(req, res));

// Get details for a specific goal
router.get('/:goalId', (req, res) => goalsController.getGoalDetails(req, res));

// Deposit to a goal
router.post('/:goalId/deposit', (req, res) => goalsController.deposit(req, res));

// Withdraw from completed goal
router.post('/:goalId/withdraw', (req, res) => goalsController.withdrawCompleted(req, res));

// Early withdrawal with penalty
router.post('/:goalId/withdraw-early', (req, res) => goalsController.withdrawEarly(req, res));

// Sync goal from blockchain (force immediate update)
router.post('/:goalId/sync', (req, res) => goalsController.syncGoalFromBlockchain(req, res));

// Get supported currencies with APYs
router.get('/currencies/list', (req, res) => goalsController.getSupportedCurrencies(req, res));

export default router;
