import { Request, Response } from 'express';
export declare class GoalsController {
    /**
     * Create a new goal
     * POST /api/goals
     */
    createGoal(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get goal details
     * GET /api/goals/:goalId
     */
    getGoalDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get user's goals
     * GET /api/users/:address/goals
     */
    getUserGoals(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Deposit to a goal
     * POST /api/goals/:goalId/deposit
     */
    deposit(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Withdraw from completed goal
     * POST /api/goals/:goalId/withdraw
     */
    withdrawCompleted(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Early withdrawal with penalty
     * POST /api/goals/:goalId/withdraw-early
     */
    withdrawEarly(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get supported currencies and APYs
     * GET /api/goals/currencies
     */
    getSupportedCurrencies(req: Request, res: Response): Promise<void>;
}
export declare const goalsController: GoalsController;
//# sourceMappingURL=goals.controller.d.ts.map