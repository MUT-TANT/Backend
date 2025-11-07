"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const goals_controller_1 = require("../controllers/goals.controller");
const router = (0, express_1.Router)();
/**
 * Goal management routes
 */
// Create a new savings goal
router.post('/', (req, res) => goals_controller_1.goalsController.createGoal(req, res));
// Get details for a specific goal
router.get('/:goalId', (req, res) => goals_controller_1.goalsController.getGoalDetails(req, res));
// Deposit to a goal
router.post('/:goalId/deposit', (req, res) => goals_controller_1.goalsController.deposit(req, res));
// Withdraw from completed goal
router.post('/:goalId/withdraw', (req, res) => goals_controller_1.goalsController.withdrawCompleted(req, res));
// Early withdrawal with penalty
router.post('/:goalId/withdraw-early', (req, res) => goals_controller_1.goalsController.withdrawEarly(req, res));
// Get supported currencies with APYs
router.get('/currencies/list', (req, res) => goals_controller_1.goalsController.getSupportedCurrencies(req, res));
exports.default = router;
//# sourceMappingURL=goals.routes.js.map