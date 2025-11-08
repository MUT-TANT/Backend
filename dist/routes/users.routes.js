"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const goals_controller_1 = require("../controllers/goals.controller");
const router = (0, express_1.Router)();
/**
 * User-specific routes
 */
// Get all goals for a user
router.get('/:address/goals', (req, res) => goals_controller_1.goalsController.getUserGoals(req, res));
// Get user's portfolio (wallet balances + goals summary)
router.get('/:address/portfolio', (req, res) => goals_controller_1.goalsController.getUserPortfolio(req, res));
exports.default = router;
//# sourceMappingURL=users.routes.js.map