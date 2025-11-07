"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faucetController = exports.FaucetController = void 0;
const contract_service_1 = require("../services/contract.service");
class FaucetController {
    /**
     * Claim test tokens from faucet
     * POST /api/faucet/claim
     */
    async claimTokens(req, res) {
        try {
            const { tokenAddress } = req.body;
            if (!tokenAddress || !tokenAddress.startsWith('0x')) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid token address',
                });
            }
            const result = await contract_service_1.contractService.claimFromFaucet(tokenAddress);
            res.json({
                success: true,
                data: {
                    txHash: result.txHash,
                    tokenAddress,
                    explorer: `https://dashboard.tenderly.co/tx/${result.txHash}`,
                },
            });
        }
        catch (error) {
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
    async canClaim(req, res) {
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
            const result = await contract_service_1.contractService.canClaimFromFaucet(address, tokenAddress);
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
        }
        catch (error) {
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
    async getBalance(req, res) {
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
            const balance = await contract_service_1.contractService.getTokenBalance(tokenAddress, address);
            res.json({
                success: true,
                data: {
                    address,
                    tokenAddress,
                    balance,
                },
            });
        }
        catch (error) {
            console.error('Error in getBalance:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get token balance',
            });
        }
    }
}
exports.FaucetController = FaucetController;
exports.faucetController = new FaucetController();
//# sourceMappingURL=faucet.controller.js.map