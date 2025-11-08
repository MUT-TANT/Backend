import express from 'express';
import { projectsController } from '../controllers/projects.controller';

const router = express.Router();

// GET /api/projects - Get all projects (with optional filters)
router.get('/', (req, res) => projectsController.getAllProjects(req, res));

// GET /api/projects/categories - Get all categories
router.get('/categories', (req, res) => projectsController.getCategories(req, res));

// GET /api/projects/validate/:address - Validate if address is approved
router.get('/validate/:address', (req, res) => projectsController.validateProject(req, res));

// GET /api/projects/address/:address - Get project by address
router.get('/address/:address', (req, res) => projectsController.getProjectByAddress(req, res));

// GET /api/projects/:id - Get project by ID
router.get('/:id', (req, res) => projectsController.getProjectById(req, res));

export default router;
