"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const faucet_controller_1 = require("../controllers/faucet.controller");
const router = (0, express_1.Router)();
/**
 * Test token faucet routes
 */
// Claim test tokens
router.post('/claim', (req, res) => faucet_controller_1.faucetController.claimTokens(req, res));
// Check if user can claim
router.get('/can-claim/:address/:tokenAddress', (req, res) => faucet_controller_1.faucetController.canClaim(req, res));
// Get token balance
router.get('/balance/:address/:tokenAddress', (req, res) => faucet_controller_1.faucetController.getBalance(req, res));
exports.default = router;
//# sourceMappingURL=faucet.routes.js.map