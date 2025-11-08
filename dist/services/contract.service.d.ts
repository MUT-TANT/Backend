export interface Goal {
    id: bigint;
    owner: string;
    currency: string;
    mode: number;
    targetAmount: bigint;
    duration: bigint;
    donationPercentage: bigint;
    depositedAmount: bigint;
    createdAt: bigint;
    lastDepositTime: bigint;
    status: number;
}
export interface GoalDetails {
    goal: Goal;
    currentValue: bigint;
    yieldEarned: bigint;
}
export declare class ContractService {
    /**
     * Create a new savings goal
     */
    createGoal(name: string, currency: string, mode: number, // 0 = Lite, 1 = Pro
    targetAmount: string, durationInDays: number, donationPercentage: number): Promise<{
        txHash: string;
        goalId?: number;
    }>;
    /**
     * Deposit to a goal
     */
    deposit(goalId: number, amount: string): Promise<{
        txHash: string;
    }>;
    /**
     * Withdraw from completed goal
     */
    withdrawCompleted(goalId: number): Promise<{
        txHash: string;
    }>;
    /**
     * Early withdrawal with penalty
     */
    withdrawEarly(goalId: number): Promise<{
        txHash: string;
    }>;
    /**
     * Get goal details
     */
    getGoalDetails(goalId: number): Promise<GoalDetails>;
    /**
     * Get all goals for a user
     */
    getUserGoals(userAddress: string): Promise<number[]>;
    /**
     * Get supported currencies
     */
    getSupportedCurrencies(): Promise<string[]>;
    /**
     * Get fallback currencies (mainnet addresses)
     */
    private getFallbackCurrencies;
    /**
     * Get vault APY
     */
    getVaultAPY(currency: string, mode: number): Promise<string>;
    /**
     * Update donation percentage
     */
    setDonationPercentage(goalId: number, newPercentage: number): Promise<{
        txHash: string;
    }>;
    /**
     * Get token balance
     */
    getTokenBalance(tokenAddress: string, userAddress: string): Promise<string>;
    /**
     * Claim tokens from faucet
     */
    claimFromFaucet(tokenAddress: string): Promise<{
        txHash: string;
    }>;
    /**
     * Check if user can claim from faucet
     */
    canClaimFromFaucet(userAddress: string, tokenAddress: string): Promise<{
        canClaim: boolean;
        nextClaimTime: number;
    }>;
}
export declare const contractService: ContractService;
//# sourceMappingURL=contract.service.d.ts.map