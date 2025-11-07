import { ethers } from 'ethers';
import { blockchainService } from './blockchain.service';
import { TOKEN_ADDRESSES } from '../config/contracts';

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

export class ContractService {
  /**
   * Create a new savings goal
   */
  async createGoal(
    name: string,
    currency: string,
    mode: number, // 0 = Lite, 1 = Pro
    targetAmount: string,
    durationInDays: number,
    donationPercentage: number // 0-10000 (basis points)
  ): Promise<{ txHash: string; goalId?: number }> {
    try {
      // Get token decimals
      const tokenContract = blockchainService.getERC20Contract(currency);
      const decimals = await tokenContract.decimals();

      // Parse target amount with proper decimals
      const targetAmountWei = blockchainService.parseUnits(targetAmount, decimals);

      // Convert days to seconds
      const durationInSeconds = durationInDays * 24 * 60 * 60;

      // Create goal transaction
      const tx = await blockchainService.stackSaveContract.createGoal(
        name,
        currency,
        mode,
        targetAmountWei,
        durationInSeconds,
        donationPercentage
      );

      console.log(`📝 Goal creation transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ Goal created in block ${receipt.blockNumber}`);

      // Parse GoalCreated event to get goal ID
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = blockchainService.stackSaveContract.interface.parseLog(log);
          return parsed?.name === 'GoalCreated';
        } catch {
          return false;
        }
      });

      let goalId: number | undefined;
      if (event) {
        const parsed = blockchainService.stackSaveContract.interface.parseLog(event);
        goalId = Number(parsed?.args[0]);
        console.log(`🎯 Goal ID: ${goalId}`);
      }

      return { txHash: tx.hash, goalId };
    } catch (error: any) {
      console.error('❌ Error creating goal:', error.message);
      throw error;
    }
  }

  /**
   * Deposit to a goal
   */
  async deposit(goalId: number, amount: string): Promise<{ txHash: string }> {
    try {
      // Get goal details to know the currency
      const goalDetails = await this.getGoalDetails(goalId);
      const currency = goalDetails.goal.currency;

      // Get token decimals
      const tokenContract = blockchainService.getERC20Contract(currency);
      const decimals = await tokenContract.decimals();

      // Parse amount
      const amountWei = blockchainService.parseUnits(amount, decimals);

      // Check allowance
      const allowance = await tokenContract.allowance(
        blockchainService.getWallet().address,
        await blockchainService.stackSaveContract.getAddress()
      );

      // Approve if needed
      if (allowance < amountWei) {
        console.log('🔓 Approving token spend...');
        const approveTx = await tokenContract.approve(
          await blockchainService.stackSaveContract.getAddress(),
          amountWei
        );
        await approveTx.wait();
        console.log('✅ Token approved');
      }

      // Deposit
      const tx = await blockchainService.stackSaveContract.deposit(goalId, amountWei);
      console.log(`💰 Deposit transaction sent: ${tx.hash}`);

      await tx.wait();
      console.log(`✅ Deposit confirmed`);

      return { txHash: tx.hash };
    } catch (error: any) {
      console.error('❌ Error depositing:', error.message);
      throw error;
    }
  }

  /**
   * Withdraw from completed goal
   */
  async withdrawCompleted(goalId: number): Promise<{ txHash: string }> {
    try {
      const tx = await blockchainService.stackSaveContract.withdrawCompleted(goalId);
      console.log(`💵 Withdrawal transaction sent: ${tx.hash}`);

      await tx.wait();
      console.log(`✅ Withdrawal completed`);

      return { txHash: tx.hash };
    } catch (error: any) {
      console.error('❌ Error withdrawing:', error.message);
      throw error;
    }
  }

  /**
   * Early withdrawal with penalty
   */
  async withdrawEarly(goalId: number): Promise<{ txHash: string }> {
    try {
      const tx = await blockchainService.stackSaveContract.withdrawEarly(goalId);
      console.log(`⚠️  Early withdrawal transaction sent: ${tx.hash}`);

      await tx.wait();
      console.log(`✅ Early withdrawal completed`);

      return { txHash: tx.hash };
    } catch (error: any) {
      console.error('❌ Error with early withdrawal:', error.message);
      throw error;
    }
  }

  /**
   * Get goal details
   */
  async getGoalDetails(goalId: number): Promise<GoalDetails> {
    try {
      const result = await blockchainService.stackSaveContract.getGoalDetails(goalId);
      return {
        goal: result[0],
        currentValue: result[1],
        yieldEarned: result[2],
      };
    } catch (error: any) {
      console.error('❌ Error getting goal details:', error.message);
      throw error;
    }
  }

  /**
   * Get all goals for a user
   */
  async getUserGoals(userAddress: string): Promise<number[]> {
    try {
      const goalIds = await blockchainService.stackSaveContract.getUserGoals(userAddress);
      return goalIds.map((id: bigint) => Number(id));
    } catch (error: any) {
      console.error('❌ Error getting user goals:', error.message);
      throw error;
    }
  }

  /**
   * Get supported currencies
   */
  async getSupportedCurrencies(): Promise<string[]> {
    try {
      return await blockchainService.stackSaveContract.getSupportedCurrencies();
    } catch (error: any) {
      console.error('❌ Error getting supported currencies:', error.message);
      throw error;
    }
  }

  /**
   * Get vault APY
   */
  async getVaultAPY(currency: string, mode: number): Promise<string> {
    try {
      const apy = await blockchainService.stackSaveContract.getVaultAPY(currency, mode);
      // APY is returned in basis points, convert to percentage
      return (Number(apy) / 100).toFixed(2);
    } catch (error: any) {
      console.error('❌ Error getting vault APY:', error.message);
      throw error;
    }
  }

  /**
   * Update donation percentage
   */
  async setDonationPercentage(goalId: number, newPercentage: number): Promise<{ txHash: string }> {
    try {
      const tx = await blockchainService.stackSaveContract.setDonationPercentage(goalId, newPercentage);
      await tx.wait();
      return { txHash: tx.hash };
    } catch (error: any) {
      console.error('❌ Error updating donation percentage:', error.message);
      throw error;
    }
  }

  /**
   * Get token balance
   */
  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    try {
      const tokenContract = blockchainService.getERC20Contract(tokenAddress);
      const [balance, decimals] = await Promise.all([
        tokenContract.balanceOf(userAddress),
        tokenContract.decimals(),
      ]);
      return blockchainService.formatUnits(balance, decimals);
    } catch (error: any) {
      console.error('❌ Error getting token balance:', error.message);
      throw error;
    }
  }

  /**
   * Claim tokens from faucet
   */
  async claimFromFaucet(tokenAddress: string): Promise<{ txHash: string }> {
    try {
      const tx = await blockchainService.faucetContract.claimTokens(tokenAddress);
      console.log(`🚰 Faucet claim transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log(`✅ Tokens claimed`);
      return { txHash: tx.hash };
    } catch (error: any) {
      console.error('❌ Error claiming from faucet:', error.message);
      throw error;
    }
  }

  /**
   * Check if user can claim from faucet
   */
  async canClaimFromFaucet(userAddress: string, tokenAddress: string): Promise<{ canClaim: boolean; nextClaimTime: number }> {
    try {
      const result = await blockchainService.faucetContract.canClaim(userAddress, tokenAddress);
      return {
        canClaim: result[0],
        nextClaimTime: Number(result[1]),
      };
    } catch (error: any) {
      console.error('❌ Error checking faucet eligibility:', error.message);
      throw error;
    }
  }
}

export const contractService = new ContractService();
