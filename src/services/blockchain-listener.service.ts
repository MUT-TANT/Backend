import { ethers } from 'ethers';
import { blockchainService } from './blockchain.service';
import { databaseService } from './database.service';
import { contractService } from './contract.service';

/**
 * Blockchain Event Listener Service
 * Listens for on-chain events and syncs database with blockchain state
 */
class BlockchainListenerService {
  private isListening: boolean = false;
  private eventFilters: Map<string, ethers.EventLog[]> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 5000; // 5 seconds

  constructor() {
    console.log('🎧 Blockchain listener service initialized');
  }

  /**
   * Start listening to blockchain events
   */
  async startListening(): Promise<void> {
    if (this.isListening) {
      console.log('⚠️  Event listener already running');
      return;
    }

    try {
      const contract = blockchainService.stackSaveContract;
      const provider = blockchainService.getProvider();

      // Get current block to start listening from
      const currentBlock = await provider.getBlockNumber();
      console.log(`🎧 Starting event listener from block ${currentBlock}`);

      // Listen for Deposited events
      contract.on(
        'Deposited',
        async (
          goalId: bigint,
          user: string,
          amount: bigint,
          vaultShares: bigint,
          event: ethers.EventLog
        ) => {
          console.log('🔔 Deposited event detected:');
          console.log(`   Goal ID: ${goalId}`);
          console.log(`   User: ${user}`);
          console.log(`   Amount: ${ethers.formatEther(amount)} tokens`);
          console.log(`   Vault Shares: ${vaultShares}`);
          console.log(`   Block: ${event.blockNumber}`);
          console.log(`   TX: ${event.transactionHash}`);

          await this.handleDepositEvent(
            Number(goalId),
            user,
            amount,
            vaultShares,
            event.transactionHash
          );
        }
      );

      // Listen for WithdrawnCompleted events
      contract.on(
        'WithdrawnCompleted',
        async (
          goalId: bigint,
          user: string,
          principal: bigint,
          yieldAmount: bigint,
          userYield: bigint,
          donatedYield: bigint,
          event: ethers.EventLog
        ) => {
          console.log('🔔 WithdrawnCompleted event detected:');
          console.log(`   Goal ID: ${goalId}`);
          console.log(`   User: ${user}`);
          console.log(`   Principal: ${ethers.formatEther(principal)} tokens`);
          console.log(`   Total Yield: ${ethers.formatEther(yieldAmount)} tokens`);
          console.log(`   User Yield: ${ethers.formatEther(userYield)} tokens`);
          console.log(`   Donated Yield: ${ethers.formatEther(donatedYield)} tokens`);
          console.log(`   Block: ${event.blockNumber}`);
          console.log(`   TX: ${event.transactionHash}`);

          await this.handleWithdrawCompletedEvent(
            Number(goalId),
            user,
            principal,
            userYield,
            donatedYield,
            event.transactionHash
          );
        }
      );

      // Listen for WithdrawnEarly events
      contract.on(
        'WithdrawnEarly',
        async (
          goalId: bigint,
          user: string,
          amount: bigint,
          penalty: bigint,
          penaltyToRewards: bigint,
          penaltyToTreasury: bigint,
          event: ethers.EventLog
        ) => {
          console.log('🔔 WithdrawnEarly event detected:');
          console.log(`   Goal ID: ${goalId}`);
          console.log(`   User: ${user}`);
          console.log(`   Amount: ${ethers.formatEther(amount)} tokens`);
          console.log(`   Penalty: ${ethers.formatEther(penalty)} tokens`);
          console.log(`   Penalty to Rewards: ${ethers.formatEther(penaltyToRewards)} tokens`);
          console.log(`   Penalty to Treasury: ${ethers.formatEther(penaltyToTreasury)} tokens`);
          console.log(`   Block: ${event.blockNumber}`);
          console.log(`   TX: ${event.transactionHash}`);

          await this.handleWithdrawEarlyEvent(
            Number(goalId),
            user,
            amount,
            penalty,
            event.transactionHash
          );
        }
      );

      // Handle provider errors and reconnection
      provider.on('error', (error) => {
        console.error('❌ Provider error:', error);
        this.handleProviderError();
      });

      this.isListening = true;
      this.reconnectAttempts = 0;
      console.log('✅ Event listener started successfully');
    } catch (error) {
      console.error('❌ Failed to start event listener:', error);
      this.handleProviderError();
    }
  }

  /**
   * Stop listening to blockchain events
   */
  stopListening(): void {
    if (!this.isListening) {
      console.log('⚠️  Event listener not running');
      return;
    }

    try {
      const contract = blockchainService.stackSaveContract;

      // Remove all listeners
      contract.removeAllListeners('Deposited');
      contract.removeAllListeners('WithdrawnCompleted');
      contract.removeAllListeners('WithdrawnEarly');

      const provider = blockchainService.getProvider();
      provider.removeAllListeners('error');

      this.isListening = false;
      console.log('🛑 Event listener stopped');
    } catch (error) {
      console.error('❌ Error stopping event listener:', error);
    }
  }

  /**
   * Handle Deposited event
   */
  private async handleDepositEvent(
    goalId: number,
    userAddress: string,
    amount: bigint,
    vaultShares: bigint,
    txHash: string
  ): Promise<void> {
    try {
      console.log(`📊 Processing deposit for goal ${goalId}...`);

      // Get updated goal details from blockchain
      const goalDetails = await contractService.getGoalDetails(goalId);

      // Update goal in database
      await databaseService.updateGoal(goalId, {
        depositedAmount: goalDetails.goal.depositedAmount.toString(),
        currentValue: goalDetails.currentValue.toString(),
        yieldEarned: goalDetails.yieldEarned.toString(),
        status: Number(goalDetails.goal.status),
        lastDepositTime: new Date(),
      });

      // Create daily save record for streak tracking
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await databaseService.createDailySave({
        userId: userAddress.toLowerCase(),
        goalId: goalId,
        amount: amount.toString(),
        date: today,
        txHash: txHash,
      });

      // Create transaction record for history
      await databaseService.createTransaction({
        goalId: goalId,
        txHash: txHash,
        type: 'deposit',
        amount: amount.toString(),
        timestamp: new Date(),
      });

      console.log(`✅ Database synced for goal ${goalId}`);
    } catch (error) {
      console.error(`❌ Error handling deposit event for goal ${goalId}:`, error);
      // TODO: Implement retry mechanism or dead letter queue
    }
  }

  /**
   * Handle WithdrawnCompleted event (normal withdrawal after duration)
   */
  private async handleWithdrawCompletedEvent(
    goalId: number,
    userAddress: string,
    principal: bigint,
    userYield: bigint,
    donatedYield: bigint,
    txHash: string
  ): Promise<void> {
    try {
      console.log(`📊 Processing completed withdrawal for goal ${goalId}...`);

      // Get updated goal details from blockchain
      const goalDetails = await contractService.getGoalDetails(goalId);

      // Update goal in database
      await databaseService.updateGoal(goalId, {
        depositedAmount: goalDetails.goal.depositedAmount.toString(),
        currentValue: goalDetails.currentValue.toString(),
        yieldEarned: goalDetails.yieldEarned.toString(),
        status: Number(goalDetails.goal.status), // Should be 2 (Withdrawn)
      });

      // Create transaction record for history
      const totalAmount = principal + userYield;
      await databaseService.createTransaction({
        goalId: goalId,
        txHash: txHash,
        type: 'withdraw',
        amount: totalAmount.toString(),
        timestamp: new Date(),
      });

      console.log(`✅ Database synced for completed withdrawal on goal ${goalId}`);
      console.log(`   Principal returned: ${principal}`);
      console.log(`   User yield: ${userYield}`);
      console.log(`   Donated yield: ${donatedYield}`);
    } catch (error) {
      console.error(`❌ Error handling withdraw completed event for goal ${goalId}:`, error);
    }
  }

  /**
   * Handle WithdrawnEarly event (early withdrawal with penalty)
   */
  private async handleWithdrawEarlyEvent(
    goalId: number,
    userAddress: string,
    amount: bigint,
    penalty: bigint,
    txHash: string
  ): Promise<void> {
    try {
      console.log(`📊 Processing early withdrawal for goal ${goalId}...`);

      // Get updated goal details from blockchain
      const goalDetails = await contractService.getGoalDetails(goalId);

      // Update goal in database
      await databaseService.updateGoal(goalId, {
        depositedAmount: goalDetails.goal.depositedAmount.toString(),
        currentValue: goalDetails.currentValue.toString(),
        yieldEarned: goalDetails.yieldEarned.toString(),
        status: Number(goalDetails.goal.status), // Should be 2 (Withdrawn)
      });

      // Create transaction record for history
      await databaseService.createTransaction({
        goalId: goalId,
        txHash: txHash,
        type: 'withdrawEarly',
        amount: amount.toString(),
        timestamp: new Date(),
      });

      console.log(`✅ Database synced for early withdrawal on goal ${goalId}`);
      console.log(`   Amount withdrawn: ${amount}`);
      console.log(`   Penalty applied: ${penalty}`);
    } catch (error) {
      console.error(`❌ Error handling withdraw early event for goal ${goalId}:`, error);
    }
  }

  /**
   * Handle provider errors and attempt reconnection
   */
  private async handleProviderError(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `❌ Max reconnection attempts (${this.maxReconnectAttempts}) reached. Stopping listener.`
      );
      this.stopListening();
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    // Stop current listener
    this.stopListening();

    // Wait before reconnecting
    await new Promise((resolve) =>
      setTimeout(resolve, this.reconnectDelay * this.reconnectAttempts)
    );

    // Attempt to restart
    await this.startListening();
  }

  /**
   * Get listener status
   */
  getStatus(): {
    isListening: boolean;
    reconnectAttempts: number;
  } {
    return {
      isListening: this.isListening,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * Manually sync a specific goal from blockchain to database
   * Useful for historical sync or recovery
   */
  async syncGoal(goalId: number): Promise<void> {
    try {
      console.log(`🔄 Manually syncing goal ${goalId}...`);

      const goalDetails = await contractService.getGoalDetails(goalId);

      await databaseService.updateGoal(goalId, {
        depositedAmount: goalDetails.goal.depositedAmount.toString(),
        currentValue: goalDetails.currentValue.toString(),
        yieldEarned: goalDetails.yieldEarned.toString(),
        status: Number(goalDetails.goal.status),
      });

      console.log(`✅ Goal ${goalId} synced successfully`);
    } catch (error) {
      console.error(`❌ Error syncing goal ${goalId}:`, error);
      throw error;
    }
  }

  /**
   * Sync all goals for a user from blockchain to database
   * Useful for initial sync or recovery
   */
  async syncUserGoals(userAddress: string): Promise<void> {
    try {
      console.log(`🔄 Syncing all goals for user ${userAddress}...`);

      // Get goals from database for this user
      const userGoals = await databaseService.getUserGoals(userAddress);

      for (const goal of userGoals) {
        await this.syncGoal(goal.id);
      }

      console.log(`✅ All goals synced for user ${userAddress}`);
    } catch (error) {
      console.error(`❌ Error syncing user goals for ${userAddress}:`, error);
      throw error;
    }
  }
}

// Singleton instance
export const blockchainListenerService = new BlockchainListenerService();
