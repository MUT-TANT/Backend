"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractService = exports.ContractService = void 0;
const blockchain_service_1 = require("./blockchain.service");
class ContractService {
    /**
     * Create a new savings goal
     */
    async createGoal(name, currency, mode, // 0 = Lite, 1 = Pro
    targetAmount, durationInDays, donationPercentage // 0-10000 (basis points)
    ) {
        try {
            // Get token decimals
            const tokenContract = blockchain_service_1.blockchainService.getERC20Contract(currency);
            const decimals = await tokenContract.decimals();
            // Parse target amount with proper decimals
            const targetAmountWei = blockchain_service_1.blockchainService.parseUnits(targetAmount, decimals);
            // Convert days to seconds
            const durationInSeconds = durationInDays * 24 * 60 * 60;
            // Create goal transaction
            const tx = await blockchain_service_1.blockchainService.stackSaveContract.createGoal(name, currency, mode, targetAmountWei, durationInSeconds, donationPercentage);
            console.log(`📝 Goal creation transaction sent: ${tx.hash}`);
            // Wait for confirmation
            const receipt = await tx.wait();
            console.log(`✅ Goal created in block ${receipt.blockNumber}`);
            // Parse GoalCreated event to get goal ID
            const event = receipt.logs.find((log) => {
                try {
                    const parsed = blockchain_service_1.blockchainService.stackSaveContract.interface.parseLog(log);
                    return parsed?.name === 'GoalCreated';
                }
                catch {
                    return false;
                }
            });
            let goalId;
            if (event) {
                const parsed = blockchain_service_1.blockchainService.stackSaveContract.interface.parseLog(event);
                goalId = Number(parsed?.args[0]);
                console.log(`🎯 Goal ID: ${goalId}`);
            }
            return { txHash: tx.hash, goalId };
        }
        catch (error) {
            console.error('❌ Error creating goal:', error.message);
            throw error;
        }
    }
    /**
     * Deposit to a goal
     */
    async deposit(goalId, amount) {
        try {
            // Get goal details to know the currency
            const goalDetails = await this.getGoalDetails(goalId);
            const currency = goalDetails.goal.currency;
            // Get token decimals
            const tokenContract = blockchain_service_1.blockchainService.getERC20Contract(currency);
            const decimals = await tokenContract.decimals();
            // Parse amount
            const amountWei = blockchain_service_1.blockchainService.parseUnits(amount, decimals);
            // Check allowance
            const allowance = await tokenContract.allowance(blockchain_service_1.blockchainService.getWallet().address, await blockchain_service_1.blockchainService.stackSaveContract.getAddress());
            // Approve if needed
            if (allowance < amountWei) {
                console.log('🔓 Approving token spend...');
                const approveTx = await tokenContract.approve(await blockchain_service_1.blockchainService.stackSaveContract.getAddress(), amountWei);
                await approveTx.wait();
                console.log('✅ Token approved');
            }
            // Deposit
            const tx = await blockchain_service_1.blockchainService.stackSaveContract.deposit(goalId, amountWei);
            console.log(`💰 Deposit transaction sent: ${tx.hash}`);
            await tx.wait();
            console.log(`✅ Deposit confirmed`);
            return { txHash: tx.hash };
        }
        catch (error) {
            console.error('❌ Error depositing:', error.message);
            throw error;
        }
    }
    /**
     * Withdraw from completed goal
     */
    async withdrawCompleted(goalId) {
        try {
            const tx = await blockchain_service_1.blockchainService.stackSaveContract.withdrawCompleted(goalId);
            console.log(`💵 Withdrawal transaction sent: ${tx.hash}`);
            await tx.wait();
            console.log(`✅ Withdrawal completed`);
            return { txHash: tx.hash };
        }
        catch (error) {
            console.error('❌ Error withdrawing:', error.message);
            throw error;
        }
    }
    /**
     * Early withdrawal with penalty
     */
    async withdrawEarly(goalId) {
        try {
            const tx = await blockchain_service_1.blockchainService.stackSaveContract.withdrawEarly(goalId);
            console.log(`⚠️  Early withdrawal transaction sent: ${tx.hash}`);
            await tx.wait();
            console.log(`✅ Early withdrawal completed`);
            return { txHash: tx.hash };
        }
        catch (error) {
            console.error('❌ Error with early withdrawal:', error.message);
            throw error;
        }
    }
    /**
     * Get goal details
     */
    async getGoalDetails(goalId) {
        try {
            const result = await blockchain_service_1.blockchainService.stackSaveContract.getGoalDetails(goalId);
            return {
                goal: result[0],
                currentValue: result[1],
                yieldEarned: result[2],
            };
        }
        catch (error) {
            console.error('❌ Error getting goal details:', error.message);
            throw error;
        }
    }
    /**
     * Get all goals for a user
     */
    async getUserGoals(userAddress) {
        try {
            const goalIds = await blockchain_service_1.blockchainService.stackSaveContract.getUserGoals(userAddress);
            return goalIds.map((id) => Number(id));
        }
        catch (error) {
            console.error('❌ Error getting user goals:', error.message);
            throw error;
        }
    }
    /**
     * Get supported currencies
     */
    async getSupportedCurrencies() {
        try {
            return await blockchain_service_1.blockchainService.stackSaveContract.getSupportedCurrencies();
        }
        catch (error) {
            console.error('❌ Error getting supported currencies:', error.message);
            throw error;
        }
    }
    /**
     * Get vault APY
     */
    async getVaultAPY(currency, mode) {
        try {
            const apy = await blockchain_service_1.blockchainService.stackSaveContract.getVaultAPY(currency, mode);
            // APY is returned in basis points, convert to percentage
            return (Number(apy) / 100).toFixed(2);
        }
        catch (error) {
            console.error('❌ Error getting vault APY:', error.message);
            throw error;
        }
    }
    /**
     * Update donation percentage
     */
    async setDonationPercentage(goalId, newPercentage) {
        try {
            const tx = await blockchain_service_1.blockchainService.stackSaveContract.setDonationPercentage(goalId, newPercentage);
            await tx.wait();
            return { txHash: tx.hash };
        }
        catch (error) {
            console.error('❌ Error updating donation percentage:', error.message);
            throw error;
        }
    }
    /**
     * Get token balance
     */
    async getTokenBalance(tokenAddress, userAddress) {
        try {
            const tokenContract = blockchain_service_1.blockchainService.getERC20Contract(tokenAddress);
            const [balance, decimals] = await Promise.all([
                tokenContract.balanceOf(userAddress),
                tokenContract.decimals(),
            ]);
            return blockchain_service_1.blockchainService.formatUnits(balance, decimals);
        }
        catch (error) {
            console.error('❌ Error getting token balance:', error.message);
            throw error;
        }
    }
    /**
     * Claim tokens from faucet
     */
    async claimFromFaucet(tokenAddress) {
        try {
            const tx = await blockchain_service_1.blockchainService.faucetContract.claimTokens(tokenAddress);
            console.log(`🚰 Faucet claim transaction sent: ${tx.hash}`);
            await tx.wait();
            console.log(`✅ Tokens claimed`);
            return { txHash: tx.hash };
        }
        catch (error) {
            console.error('❌ Error claiming from faucet:', error.message);
            throw error;
        }
    }
    /**
     * Check if user can claim from faucet
     */
    async canClaimFromFaucet(userAddress, tokenAddress) {
        try {
            const result = await blockchain_service_1.blockchainService.faucetContract.canClaim(userAddress, tokenAddress);
            return {
                canClaim: result[0],
                nextClaimTime: Number(result[1]),
            };
        }
        catch (error) {
            console.error('❌ Error checking faucet eligibility:', error.message);
            throw error;
        }
    }
}
exports.ContractService = ContractService;
exports.contractService = new ContractService();
//# sourceMappingURL=contract.service.js.map