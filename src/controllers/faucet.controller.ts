import { Request, Response } from 'express';
import { contractService } from '../services/contract.service';

export class FaucetController {
  /**
   * Claim test tokens from faucet
   * POST /api/faucet/claim
   */
  async claimTokens(req: Request, res: Response) {
    try {
      const { tokenAddress } = req.body;

      if (!tokenAddress || !tokenAddress.startsWith('0x')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid token address',
        });
      }

      const result = await contractService.claimFromFaucet(tokenAddress);

      res.json({
        success: true,
        data: {
          txHash: result.txHash,
          tokenAddress,
          explorer: `https://dashboard.tenderly.co/tx/${result.txHash}`,
        },
      });
    } catch (error: any) {
      console.error('Error in claimTokens:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to claim tokens',
      });
    }
  }

  /**
   * Check if user can claim from faucet
   * GET /api/faucet/can-claim/:address/:tokenAddress
   */
  async canClaim(req: Request, res: Response) {
    try {
      const { address, tokenAddress } = req.params;

      if (!address || !address.startsWith('0x')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user address',
        });
      }

      if (!tokenAddress || !tokenAddress.startsWith('0x')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid token address',
        });
      }

      const result = await contractService.canClaimFromFaucet(address, tokenAddress);

      res.json({
        success: true,
        data: {
          canClaim: result.canClaim,
          nextClaimTime: result.nextClaimTime,
          nextClaimDate: result.nextClaimTime > 0
            ? new Date(result.nextClaimTime * 1000).toISOString()
            : null,
        },
      });
    } catch (error: any) {
      console.error('Error in canClaim:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to check claim eligibility',
      });
    }
  }

  /**
   * Get token balance for a user
   * GET /api/faucet/balance/:address/:tokenAddress
   */
  async getBalance(req: Request, res: Response) {
    try {
      const { address, tokenAddress } = req.params;

      if (!address || !address.startsWith('0x')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user address',
        });
      }

      if (!tokenAddress || !tokenAddress.startsWith('0x')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid token address',
        });
      }

      const balance = await contractService.getTokenBalance(tokenAddress, address);

      res.json({
        success: true,
        data: {
          address,
          tokenAddress,
          balance,
        },
      });
    } catch (error: any) {
      console.error('Error in getBalance:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get token balance',
      });
    }
  }
}

export const faucetController = new FaucetController();
