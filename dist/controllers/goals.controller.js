"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalsController = exports.GoalsController = void 0;
const contract_service_1 = require("../services/contract.service");
const database_service_1 = require("../services/database.service");
class GoalsController {
    /**
     * Create a new goal
     * POST /api/goals
     */
    async createGoal(req, res) {
        try {
            const { name, currency, mode, targetAmount, durationInDays, donationPercentage, owner } = req.body;
            // Validation
            if (!name || !currency || mode === undefined || !targetAmount || !durationInDays || donationPercentage === undefined || !owner) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields',
                });
            }
            if (mode !== 0 && mode !== 1) {
                return res.status(400).json({
                    success: false,
                    error: 'Mode must be 0 (Lite) or 1 (Pro)',
                });
            }
            if (donationPercentage < 0 || donationPercentage > 10000) {
                return res.status(400).json({
                    success: false,
                    error: 'Donation percentage must be between 0 and 10000',
                });
            }
            // Create goal in database (off-chain)
            const goal = await database_service_1.databaseService.createGoal({
                name,
                owner,
                currency,
                mode,
                targetAmount,
                duration: durationInDays,
                donationPercentage,
            });
            res.status(201).json({
                success: true,
                data: {
                    goalId: goal.id,
                    goal: {
                        id: goal.id,
                        name: goal.name,
                        owner: goal.owner,
                        currency: goal.currency,
                        mode: goal.mode,
                        targetAmount: goal.targetAmount,
                        duration: goal.duration,
                        donationPercentage: goal.donationPercentage,
                        status: goal.status,
                        statusText: ['Active', 'Completed', 'Abandoned', 'Withdrawn'][goal.status],
                        createdAt: goal.createdAt.getTime(),
                    },
                    message: 'Goal created successfully',
                },
            });
        }
        catch (error) {
            console.error('Error in createGoal:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to create goal',
            });
        }
    }
    /**
     * Get goal details
     * GET /api/goals/:goalId
     */
    async getGoalDetails(req, res) {
        try {
            const { goalId } = req.params;
            if (!goalId || isNaN(Number(goalId))) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid goal ID',
                });
            }
            const goal = await database_service_1.databaseService.getGoal(Number(goalId));
            if (!goal) {
                return res.status(404).json({
                    success: false,
                    error: 'Goal not found',
                });
            }
            // Format the response
            const formattedGoal = {
                id: goal.id,
                owner: goal.owner,
                currency: goal.currency,
                mode: goal.mode,
                targetAmount: goal.targetAmount,
                duration: goal.duration,
                donationPercentage: goal.donationPercentage,
                depositedAmount: goal.depositedAmount,
                createdAt: goal.createdAt.getTime(),
                lastDepositTime: goal.lastDepositTime.getTime(),
                status: goal.status,
                statusText: ['Active', 'Completed', 'Abandoned', 'Withdrawn'][goal.status],
                currentValue: goal.currentValue,
                yieldEarned: goal.yieldEarned,
            };
            res.json({
                success: true,
                data: {
                    goal: formattedGoal,
                },
            });
        }
        catch (error) {
            console.error('Error in getGoalDetails:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get goal details',
            });
        }
    }
    /**
     * Get user's goals
     * GET /api/users/:address/goals
     */
    async getUserGoals(req, res) {
        try {
            const { address } = req.params;
            if (!address || !address.startsWith('0x')) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid address',
                });
            }
            const dbGoals = await database_service_1.databaseService.getUserGoals(address);
            // Format goals
            const goals = dbGoals.map((goal) => ({
                id: goal.id,
                owner: goal.owner,
                currency: goal.currency,
                mode: goal.mode,
                targetAmount: goal.targetAmount,
                duration: goal.duration,
                donationPercentage: goal.donationPercentage,
                depositedAmount: goal.depositedAmount,
                createdAt: goal.createdAt.getTime(),
                lastDepositTime: goal.lastDepositTime.getTime(),
                status: goal.status,
                statusText: ['Active', 'Completed', 'Abandoned', 'Withdrawn'][goal.status],
                currentValue: goal.currentValue,
                yieldEarned: goal.yieldEarned,
            }));
            res.json({
                success: true,
                data: {
                    address,
                    goals,
                    total: goals.length,
                },
            });
        }
        catch (error) {
            console.error('Error in getUserGoals:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get user goals',
            });
        }
    }
    /**
     * Deposit to a goal
     * POST /api/goals/:goalId/deposit
     */
    async deposit(req, res) {
        try {
            const { goalId } = req.params;
            const { amount } = req.body;
            if (!goalId || isNaN(Number(goalId))) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid goal ID',
                });
            }
            if (!amount) {
                return res.status(400).json({
                    success: false,
                    error: 'Amount is required',
                });
            }
            const result = await contract_service_1.contractService.deposit(Number(goalId), amount);
            res.json({
                success: true,
                data: {
                    txHash: result.txHash,
                    goalId: Number(goalId),
                    amount,
                    explorer: `https://dashboard.tenderly.co/tx/${result.txHash}`,
                },
            });
        }
        catch (error) {
            console.error('Error in deposit:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to deposit',
            });
        }
    }
    /**
     * Withdraw from completed goal
     * POST /api/goals/:goalId/withdraw
     */
    async withdrawCompleted(req, res) {
        try {
            const { goalId } = req.params;
            if (!goalId || isNaN(Number(goalId))) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid goal ID',
                });
            }
            const result = await contract_service_1.contractService.withdrawCompleted(Number(goalId));
            res.json({
                success: true,
                data: {
                    txHash: result.txHash,
                    goalId: Number(goalId),
                    explorer: `https://dashboard.tenderly.co/tx/${result.txHash}`,
                },
            });
        }
        catch (error) {
            console.error('Error in withdrawCompleted:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to withdraw',
            });
        }
    }
    /**
     * Early withdrawal with penalty
     * POST /api/goals/:goalId/withdraw-early
     */
    async withdrawEarly(req, res) {
        try {
            const { goalId } = req.params;
            if (!goalId || isNaN(Number(goalId))) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid goal ID',
                });
            }
            const result = await contract_service_1.contractService.withdrawEarly(Number(goalId));
            res.json({
                success: true,
                data: {
                    txHash: result.txHash,
                    goalId: Number(goalId),
                    penalty: '2%', // 2% penalty rate
                    explorer: `https://dashboard.tenderly.co/tx/${result.txHash}`,
                },
            });
        }
        catch (error) {
            console.error('Error in withdrawEarly:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to withdraw early',
            });
        }
    }
    /**
     * Get supported currencies and APYs
     * GET /api/goals/currencies
     */
    async getSupportedCurrencies(req, res) {
        try {
            const currencies = await contract_service_1.contractService.getSupportedCurrencies();
            // Get APY for each currency
            const currenciesWithAPY = await Promise.all(currencies.map(async (currency) => {
                const [liteAPY, proAPY] = await Promise.all([
                    contract_service_1.contractService.getVaultAPY(currency, 0),
                    contract_service_1.contractService.getVaultAPY(currency, 1),
                ]);
                return {
                    address: currency,
                    liteAPY,
                    proAPY,
                };
            }));
            res.json({
                success: true,
                data: {
                    currencies: currenciesWithAPY,
                },
            });
        }
        catch (error) {
            console.error('Error in getSupportedCurrencies:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get supported currencies',
            });
        }
    }
}
exports.GoalsController = GoalsController;
exports.goalsController = new GoalsController();
//# sourceMappingURL=goals.controller.js.map