"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class DatabaseService {
    /**
     * Create a new goal in the database
     */
    async createGoal(params) {
        const goal = await prisma.goal.create({
            data: {
                name: params.name,
                owner: params.owner.toLowerCase(), // Store addresses in lowercase
                currency: params.currency.toLowerCase(),
                mode: params.mode,
                targetAmount: params.targetAmount,
                duration: params.duration,
                donationPercentage: params.donationPercentage,
                depositedAmount: '0',
                currentValue: '0',
                yieldEarned: '0',
                status: 0, // Active
            },
        });
        return goal;
    }
    /**
     * Get a goal by ID
     */
    async getGoal(goalId) {
        const goal = await prisma.goal.findUnique({
            where: { id: goalId },
        });
        return goal;
    }
    /**
     * Get all goals for a user address
     */
    async getUserGoals(address) {
        const goals = await prisma.goal.findMany({
            where: {
                owner: address.toLowerCase(),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return goals;
    }
    /**
     * Update a goal
     */
    async updateGoal(goalId, params) {
        const goal = await prisma.goal.update({
            where: { id: goalId },
            data: params,
        });
        return goal;
    }
    /**
     * Delete a goal (for testing purposes)
     */
    async deleteGoal(goalId) {
        await prisma.goal.delete({
            where: { id: goalId },
        });
    }
    /**
     * Get goal statistics for a user
     */
    async getUserStats(address) {
        const goals = await this.getUserGoals(address);
        const stats = {
            totalGoals: goals.length,
            activeGoals: goals.filter(g => g.status === 0).length,
            completedGoals: goals.filter(g => g.status === 1).length,
            totalDeposited: goals.reduce((sum, g) => sum + parseFloat(g.depositedAmount), 0),
            totalYield: goals.reduce((sum, g) => sum + parseFloat(g.yieldEarned), 0),
        };
        return stats;
    }
    /**
     * Cleanup - disconnect Prisma client
     */
    async disconnect() {
        await prisma.$disconnect();
    }
}
exports.databaseService = new DatabaseService();
exports.default = exports.databaseService;
//# sourceMappingURL=database.service.js.map