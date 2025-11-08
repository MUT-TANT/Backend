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
     * Record a daily save for a goal
     */
    async recordDailySave(goalId, amount) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset to start of day
        // Check if save already exists for today
        const existing = await prisma.dailySave.findUnique({
            where: {
                goalId_date: {
                    goalId,
                    date: today,
                },
            },
        });
        if (existing) {
            // Update existing save
            return await prisma.dailySave.update({
                where: { id: existing.id },
                data: { amount },
            });
        }
        // Create new daily save
        const dailySave = await prisma.dailySave.create({
            data: {
                goalId,
                date: today,
                amount,
            },
        });
        // Update streak
        await this.updateStreak(goalId);
        return dailySave;
    }
    /**
     * Get daily saves for a goal (last 7 days)
     */
    async getDailySaves(goalId, days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        const saves = await prisma.dailySave.findMany({
            where: {
                goalId,
                date: {
                    gte: startDate,
                },
            },
            orderBy: {
                date: 'desc',
            },
        });
        return saves;
    }
    /**
     * Update streak for a goal
     */
    async updateStreak(goalId) {
        const goal = await prisma.goal.findUnique({ where: { id: goalId } });
        if (!goal)
            return;
        // Get all daily saves ordered by date descending
        const saves = await prisma.dailySave.findMany({
            where: { goalId },
            orderBy: { date: 'desc' },
        });
        if (saves.length === 0) {
            await prisma.goal.update({
                where: { id: goalId },
                data: {
                    currentStreak: 0,
                    lastStreakUpdate: new Date(),
                },
            });
            return;
        }
        // Calculate current streak
        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < saves.length; i++) {
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);
            const saveDate = new Date(saves[i].date);
            saveDate.setHours(0, 0, 0, 0);
            if (saveDate.getTime() === expectedDate.getTime()) {
                currentStreak++;
            }
            else {
                break;
            }
        }
        // Update goal with new streak
        await prisma.goal.update({
            where: { id: goalId },
            data: {
                currentStreak,
                longestStreak: Math.max(currentStreak, goal.longestStreak),
                lastStreakUpdate: new Date(),
            },
        });
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