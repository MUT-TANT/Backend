import { Router } from 'express';
import { faucetController } from '../controllers/faucet.controller';

const router = Router();

/**
 * Test token faucet routes
 */

// Claim test tokens
router.post('/claim', (req, res) => faucetController.claimTokens(req, res));

// Check if user can claim
router.get('/can-claim/:address/:tokenAddress', (req, res) => faucetController.canClaim(req, res));

// Get token balance
router.get('/balance/:address/:tokenAddress', (req, res) => faucetController.getBalance(req, res));

export default router;
