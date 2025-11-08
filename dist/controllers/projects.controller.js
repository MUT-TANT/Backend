"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectsController = void 0;
const projects_service_1 = require("../services/projects.service");
class ProjectsController {
    /**
     * GET /api/projects
     * Get all public goods projects
     */
    async getAllProjects(req, res) {
        try {
            const { category, search } = req.query;
            let projects;
            if (search) {
                // Search by query
                projects = projects_service_1.projectsService.searchProjects(search);
            }
            else if (category) {
                // Filter by category
                projects = projects_service_1.projectsService.getProjectsByCategory(category);
            }
            else {
                // Get all projects
                projects = projects_service_1.projectsService.getAllProjects();
            }
            res.json({
                success: true,
                data: {
                    projects,
                    total: projects.length,
                },
            });
        }
        catch (error) {
            console.error('Error getting projects:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get projects',
            });
        }
    }
    /**
     * GET /api/projects/categories
     * Get all project categories
     */
    async getCategories(req, res) {
        try {
            const categories = projects_service_1.projectsService.getCategories();
            res.json({
                success: true,
                data: {
                    categories,
                },
            });
        }
        catch (error) {
            console.error('Error getting categories:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get categories',
            });
        }
    }
    /**
     * GET /api/projects/:id
     * Get project by ID
     */
    async getProjectById(req, res) {
        try {
            const { id } = req.params;
            const project = projects_service_1.projectsService.getProjectById(id);
            if (!project) {
                return res.status(404).json({
                    success: false,
                    error: 'Project not found',
                });
            }
            res.json({
                success: true,
                data: {
                    project,
                },
            });
        }
        catch (error) {
            console.error('Error getting project:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get project',
            });
        }
    }
    /**
     * GET /api/projects/address/:address
     * Get project by address
     */
    async getProjectByAddress(req, res) {
        try {
            const { address } = req.params;
            const project = projects_service_1.projectsService.getProjectByAddress(address);
            if (!project) {
                return res.status(404).json({
                    success: false,
                    error: 'Project not found',
                });
            }
            res.json({
                success: true,
                data: {
                    project,
                },
            });
        }
        catch (error) {
            console.error('Error getting project:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get project',
            });
        }
    }
    /**
     * GET /api/projects/validate/:address
     * Check if address is an approved project
     */
    async validateProject(req, res) {
        try {
            const { address } = req.params;
            const isApproved = projects_service_1.projectsService.isApprovedProject(address);
            res.json({
                success: true,
                data: {
                    isApproved,
                    address,
                },
            });
        }
        catch (error) {
            console.error('Error validating project:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to validate project',
            });
        }
    }
}
exports.projectsController = new ProjectsController();
//# sourceMappingURL=projects.controller.js.map