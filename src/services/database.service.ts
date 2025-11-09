import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateGoalParams {
  name: string;
  owner: string;
  currency: string;
  mode: number;
  targetAmount: string;
  duration: number;
  donationPercentage: number;
}

export interface UpdateGoalParams {
  blockchainGoalId?: number;
  depositedAmount?: string;
  currentValue?: string;
  yieldEarned?: string;
  status?: number;
  lastDepositTime?: Date;
}

class DatabaseService {
  /**
   * Create a new goal in the database
   */
  async createGoal(params: CreateGoalParams) {
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
  async getGoal(goalId: number) {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    return goal;
  }

  /**
   * Get all goals for a user address
   */
  async getUserGoals(address: string) {
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
  async updateGoal(goalId: number, params: UpdateGoalParams) {
    const goal = await prisma.goal.update({
      where: { id: goalId },
      data: params,
    });

    return goal;
  }

  /**
   * Delete a goal (for testing purposes)
   */
  async deleteGoal(goalId: number) {
    await prisma.goal.delete({
      where: { id: goalId },
    });
  }

  /**
   * Get goal statistics for a user
   */
  async getUserStats(address: string) {
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
   * Create a daily save record (used by blockchain event listener)
   */
  async createDailySave(params: {
    userId: string;
    goalId: number;
    amount: string;
    date: Date;
    txHash?: string;
  }) {
    const saveDate = new Date(params.date);
    saveDate.setHours(0, 0, 0, 0); // Reset to start of day

    // Check if save already exists for this date
    const existing = await prisma.dailySave.findUnique({
      where: {
        goalId_date: {
          goalId: params.goalId,
          date: saveDate,
        },
      },
    });

    if (existing) {
      // Update existing save (aggregate amounts if multiple deposits same day)
      const newAmount = (parseFloat(existing.amount) + parseFloat(params.amount)).toString();
      const updated = await prisma.dailySave.update({
        where: { id: existing.id },
        data: {
          amount: newAmount,
          // Note: txHash not stored in current schema
        },
      });

      // Update streak
      await this.updateStreak(params.goalId);

      return updated;
    }

    // Create new daily save
    const dailySave = await prisma.dailySave.create({
      data: {
        goalId: params.goalId,
        date: saveDate,
        amount: params.amount,
      },
    });

    // Update streak
    await this.updateStreak(params.goalId);

    return dailySave;
  }

  /**
   * Record a daily save for a goal (backward compatibility)
   */
  async recordDailySave(goalId: number, amount: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day

    // Use the new createDailySave method
    return await this.createDailySave({
      userId: '', // Not used in current schema
      goalId,
      amount,
      date: today,
    });
  }

  /**
   * Get daily saves for a goal (last 7 days)
   */
  async getDailySaves(goalId: number, days: number = 7) {
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
  async updateStreak(goalId: number) {
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) return;

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
      } else {
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
   * Create transaction record
   */
  async createTransaction(data: {
    goalId: number;
    txHash: string;
    type: string;
    amount: string;
    blockNumber?: number;
    timestamp: Date;
    status?: string;
  }) {
    try {
      return await prisma.transaction.create({
        data: {
          goalId: data.goalId,
          txHash: data.txHash,
          type: data.type,
          amount: data.amount,
          blockNumber: data.blockNumber,
          timestamp: data.timestamp,
          status: data.status || 'completed',
        },
      });
    } catch (error: any) {
      // Ignore unique constraint errors (transaction already exists)
      if (error.code === 'P2002') {
        console.log(`Transaction ${data.txHash} already exists, skipping...`);
        return null;
      }
      throw error;
    }
  }

  /**
   * Get transactions for a goal
   */
  async getGoalTransactions(goalId: number) {
    return await prisma.transaction.findMany({
      where: { goalId },
      orderBy: { timestamp: 'desc' },
    });
  }

  /**
   * Get transactions for a user (across all their goals)
   */
  async getUserTransactions(userAddress: string) {
    return await prisma.transaction.findMany({
      where: {
        goal: {
          owner: userAddress.toLowerCase(),
        },
      },
      include: {
        goal: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  /**
   * Cleanup - disconnect Prisma client
   */
  async disconnect() {
    await prisma.$disconnect();
  }
}

export const databaseService = new DatabaseService();
export default databaseService;
