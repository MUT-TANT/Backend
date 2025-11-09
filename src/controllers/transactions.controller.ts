import { Request, Response } from 'express';
import databaseService from '../services/database.service';

class TransactionsController {
  /**
   * Get all transactions for a specific goal
   * GET /api/goals/:goalId/transactions
   */
  async getGoalTransactions(req: Request, res: Response) {
    try {
      const { goalId } = req.params;

      if (!goalId || isNaN(Number(goalId))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid goal ID',
        });
      }

      const transactions = await databaseService.getGoalTransactions(Number(goalId));

      res.json({
        success: true,
        data: {
          transactions,
        },
      });
    } catch (error: any) {
      console.error('Error fetching goal transactions:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch transactions',
      });
    }
  }

  /**
   * Get all transactions for a user (across all goals)
   * GET /api/users/:address/transactions
   */
  async getUserTransactions(req: Request, res: Response) {
    try {
      const { address } = req.params;

      if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid wallet address',
        });
      }

      const transactions = await databaseService.getUserTransactions(address);

      res.json({
        success: true,
        data: {
          transactions,
        },
      });
    } catch (error: any) {
      console.error('Error fetching user transactions:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch transactions',
      });
    }
  }
}

export const transactionsController = new TransactionsController();
