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
    depositedAmount?: string;
    currentValue?: string;
    yieldEarned?: string;
    status?: number;
    lastDepositTime?: Date;
}
declare class DatabaseService {
    /**
     * Create a new goal in the database
     */
    createGoal(params: CreateGoalParams): Promise<{
        currentValue: string;
        yieldEarned: string;
        name: string;
        owner: string;
        currency: string;
        mode: number;
        targetAmount: string;
        duration: number;
        donationPercentage: number;
        depositedAmount: string;
        status: number;
        createdAt: Date;
        lastDepositTime: Date;
        updatedAt: Date;
        id: number;
    }>;
    /**
     * Get a goal by ID
     */
    getGoal(goalId: number): Promise<{
        currentValue: string;
        yieldEarned: string;
        name: string;
        owner: string;
        currency: string;
        mode: number;
        targetAmount: string;
        duration: number;
        donationPercentage: number;
        depositedAmount: string;
        status: number;
        createdAt: Date;
        lastDepositTime: Date;
        updatedAt: Date;
        id: number;
    } | null>;
    /**
     * Get all goals for a user address
     */
    getUserGoals(address: string): Promise<{
        currentValue: string;
        yieldEarned: string;
        name: string;
        owner: string;
        currency: string;
        mode: number;
        targetAmount: string;
        duration: number;
        donationPercentage: number;
        depositedAmount: string;
        status: number;
        createdAt: Date;
        lastDepositTime: Date;
        updatedAt: Date;
        id: number;
    }[]>;
    /**
     * Update a goal
     */
    updateGoal(goalId: number, params: UpdateGoalParams): Promise<{
        currentValue: string;
        yieldEarned: string;
        name: string;
        owner: string;
        currency: string;
        mode: number;
        targetAmount: string;
        duration: number;
        donationPercentage: number;
        depositedAmount: string;
        status: number;
        createdAt: Date;
        lastDepositTime: Date;
        updatedAt: Date;
        id: number;
    }>;
    /**
     * Delete a goal (for testing purposes)
     */
    deleteGoal(goalId: number): Promise<void>;
    /**
     * Get goal statistics for a user
     */
    getUserStats(address: string): Promise<{
        totalGoals: number;
        activeGoals: number;
        completedGoals: number;
        totalDeposited: number;
        totalYield: number;
    }>;
    /**
     * Cleanup - disconnect Prisma client
     */
    disconnect(): Promise<void>;
}
export declare const databaseService: DatabaseService;
export default databaseService;
//# sourceMappingURL=database.service.d.ts.map