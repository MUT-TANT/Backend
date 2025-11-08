import { Request, Response } from 'express';
import { contractService } from '../services/contract.service';
import { blockchainService } from '../services/blockchain.service';
import { databaseService } from '../services/database.service';

export class GoalsController {
  /**
   * Create a new goal
   * POST /api/goals
   */
  async createGoal(req: Request, res: Response) {
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

      // Create goal in database first (off-chain)
      const goal = await databaseService.createGoal({
        name,
        owner,
        currency,
        mode,
        targetAmount,
        duration: durationInDays,
        donationPercentage,
      });

      // Create goal on blockchain
      let blockchainGoalId: number | undefined;
      let txHash: string | undefined;

      try {
        const result = await contractService.createGoal(
          name,
          currency,
          mode,
          targetAmount,
          durationInDays,
          donationPercentage
        );

        blockchainGoalId = result.goalId;
        txHash = result.txHash;

        // Update database with blockchain goal ID
        if (blockchainGoalId !== undefined) {
          await databaseService.updateGoal(goal.id, {
            blockchainGoalId,
          });
        }

        console.log(`✅ Goal created - DB ID: ${goal.id}, Blockchain ID: ${blockchainGoalId}`);
      } catch (error: any) {
        console.error('⚠️  Blockchain goal creation failed:', error.message);
        // Continue - goal is still created in database
        // Frontend can retry blockchain creation later if needed
      }

      res.status(201).json({
        success: true,
        data: {
          goalId: goal.id,
          blockchainGoalId,
          txHash,
          goal: {
            id: goal.id,
            blockchainGoalId,
            name: goal.name,
            owner: goal.owner,
            currency: goal.currency,
            mode: goal.mode,
            targetAmount: goal.targetAmount,
            duration: goal.duration,
            donationPercentage: goal.donationPercentage,
            depositedAmount: goal.depositedAmount,
            currentValue: goal.currentValue,
            yieldEarned: goal.yieldEarned,
            status: goal.status,
            statusText: ['Active', 'Completed', 'Abandoned', 'Withdrawn'][goal.status],
            createdAt: goal.createdAt.getTime(),
            lastDepositTime: goal.lastDepositTime.getTime(),
            currentStreak: goal.currentStreak,
            longestStreak: goal.longestStreak,
            dailySaves: [],
          },
          message: 'Goal created successfully' + (txHash ? ' on blockchain' : ' (blockchain pending)'),
          explorer: txHash ? `https://dashboard.tenderly.co/tx/${txHash}` : undefined,
        },
      });
    } catch (error: any) {
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
  async getGoalDetails(req: Request, res: Response) {
    try {
      const { goalId } = req.params;

      if (!goalId || isNaN(Number(goalId))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid goal ID',
        });
      }

      const goal = await databaseService.getGoal(Number(goalId));

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
    } catch (error: any) {
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
  async getUserGoals(req: Request, res: Response) {
    try {
      const { address } = req.params;

      if (!address || !address.startsWith('0x')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid address',
        });
      }

      const dbGoals = await databaseService.getUserGoals(address);

      // Get daily saves for each goal (last 7 days)
      const goalsWithSaves = await Promise.all(
        dbGoals.map(async (goal) => {
          const dailySaves = await databaseService.getDailySaves(goal.id, 7);
          return {
            ...goal,
            dailySaves,
          };
        })
      );

      // Format goals
      const goals = goalsWithSaves.map((goal) => ({
        id: goal.id,
        name: goal.name,
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
        currentStreak: goal.currentStreak,
        longestStreak: goal.longestStreak,
        dailySaves: goal.dailySaves.map((save) => ({
          date: save.date.getTime(),
          amount: save.amount,
        })),
      }));

      res.json({
        success: true,
        data: {
          address,
          goals,
          total: goals.length,
        },
      });
    } catch (error: any) {
      console.error('Error in getUserGoals:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get user goals',
      });
    }
  }

  /**
   * Get user's portfolio (wallet balances + goals summary)
   * GET /api/users/:address/portfolio
   */
  async getUserPortfolio(req: Request, res: Response) {
    try {
      const { address } = req.params;

      if (!address || !address.startsWith('0x')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid address',
        });
      }

      const provider = blockchainService.getProvider();

      // Fetch ETH balance
      const ethBalanceWei = await provider.getBalance(address);
      const ethBalance = blockchainService.formatEther(ethBalanceWei);

      // Fetch token balances for USDC, DAI, WETH
      const TOKEN_ADDRESSES = {
        USDC: process.env.USDC_ADDRESS || '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        DAI: process.env.DAI_ADDRESS || '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        WETH: process.env.WETH_ADDRESS || '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      };

      const tokens = await Promise.all(
        Object.entries(TOKEN_ADDRESSES).map(async ([symbol, tokenAddress]) => {
          const tokenContract = blockchainService.getERC20Contract(tokenAddress);

          const [balance, decimals, tokenSymbol] = await Promise.all([
            tokenContract.balanceOf(address),
            tokenContract.decimals(),
            tokenContract.symbol(),
          ]);

          return {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: Number(decimals),
            balance: blockchainService.formatUnits(balance, decimals),
            balanceRaw: balance.toString(),
          };
        })
      );

      // Fetch user goals summary
      const dbGoals = await databaseService.getUserGoals(address);

      const goalsSummary = {
        totalValue: dbGoals.reduce((sum, g) => sum + parseFloat(g.currentValue || '0'), 0).toString(),
        totalDeposited: dbGoals.reduce((sum, g) => sum + parseFloat(g.depositedAmount || '0'), 0).toString(),
        totalYield: dbGoals.reduce((sum, g) => sum + parseFloat(g.yieldEarned || '0'), 0).toString(),
        count: dbGoals.length,
      };

      // Calculate total portfolio value (simplified - just sum of numeric values)
      const totalWalletValue = parseFloat(ethBalance) +
        tokens.reduce((sum, token) => sum + parseFloat(token.balance), 0);
      const totalPortfolioValue = (totalWalletValue + parseFloat(goalsSummary.totalValue)).toString();

      res.json({
        success: true,
        data: {
          address,
          timestamp: Date.now(),
          balances: {
            eth: {
              balance: ethBalance,
              balanceWei: ethBalanceWei.toString(),
            },
            tokens,
          },
          goals: goalsSummary,
          totalPortfolioValue,
        },
      });
    } catch (error: any) {
      console.error('Error in getUserPortfolio:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get user portfolio',
      });
    }
  }

  /**
   * Deposit to a goal
   * POST /api/goals/:goalId/deposit
   */
  async deposit(req: Request, res: Response) {
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

      // Execute blockchain deposit (deposits to Morpho v2 vault)
      const result = await contractService.deposit(Number(goalId), amount);

      // Get updated goal details from blockchain after deposit
      const goalDetails = await contractService.getGoalDetails(Number(goalId));

      // Update database with blockchain state
      await databaseService.updateGoal(Number(goalId), {
        depositedAmount: goalDetails.goal.depositedAmount.toString(),
        currentValue: goalDetails.currentValue.toString(),
        yieldEarned: goalDetails.yieldEarned.toString(),
        status: Number(goalDetails.goal.status),
        lastDepositTime: new Date(),
      });

      // Record daily save for streak tracking
      await databaseService.recordDailySave(Number(goalId), amount);

      res.json({
        success: true,
        data: {
          txHash: result.txHash,
          goalId: Number(goalId),
          amount,
          explorer: `https://dashboard.tenderly.co/tx/${result.txHash}`,
        },
      });
    } catch (error: any) {
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
  async withdrawCompleted(req: Request, res: Response) {
    try {
      const { goalId } = req.params;

      if (!goalId || isNaN(Number(goalId))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid goal ID',
        });
      }

      const result = await contractService.withdrawCompleted(Number(goalId));

      res.json({
        success: true,
        data: {
          txHash: result.txHash,
          goalId: Number(goalId),
          explorer: `https://dashboard.tenderly.co/tx/${result.txHash}`,
        },
      });
    } catch (error: any) {
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
  async withdrawEarly(req: Request, res: Response) {
    try {
      const { goalId } = req.params;

      if (!goalId || isNaN(Number(goalId))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid goal ID',
        });
      }

      const result = await contractService.withdrawEarly(Number(goalId));

      res.json({
        success: true,
        data: {
          txHash: result.txHash,
          goalId: Number(goalId),
          penalty: '2%', // 2% penalty rate
          explorer: `https://dashboard.tenderly.co/tx/${result.txHash}`,
        },
      });
    } catch (error: any) {
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
  async getSupportedCurrencies(req: Request, res: Response) {
    try {
      const currencies = await contractService.getSupportedCurrencies();

      // Get APY for each currency
      const currenciesWithAPY = await Promise.all(
        currencies.map(async (currency) => {
          const [liteAPY, proAPY] = await Promise.all([
            contractService.getVaultAPY(currency, 0),
            contractService.getVaultAPY(currency, 1),
          ]);

          return {
            address: currency,
            liteAPY,
            proAPY,
          };
        })
      );

      res.json({
        success: true,
        data: {
          currencies: currenciesWithAPY,
        },
      });
    } catch (error: any) {
      console.error('Error in getSupportedCurrencies:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get supported currencies',
      });
    }
  }
}

export const goalsController = new GoalsController();
