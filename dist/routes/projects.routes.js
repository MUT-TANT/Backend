"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const projects_controller_1 = require("../controllers/projects.controller");
const router = express_1.default.Router();
// GET /api/projects - Get all projects (with optional filters)
router.get('/', (req, res) => projects_controller_1.projectsController.getAllProjects(req, res));
// GET /api/projects/categories - Get all categories
router.get('/categories', (req, res) => projects_controller_1.projectsController.getCategories(req, res));
// GET /api/projects/validate/:address - Validate if address is approved
router.get('/validate/:address', (req, res) => projects_controller_1.projectsController.validateProject(req, res));
// GET /api/projects/address/:address - Get project by address
router.get('/address/:address', (req, res) => projects_controller_1.projectsController.getProjectByAddress(req, res));
// GET /api/projects/:id - Get project by ID
router.get('/:id', (req, res) => projects_controller_1.projectsController.getProjectById(req, res));
exports.default = router;
//# sourceMappingURL=projects.routes.js.map