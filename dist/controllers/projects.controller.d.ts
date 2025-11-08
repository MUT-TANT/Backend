import { Request, Response } from 'express';
declare class ProjectsController {
    /**
     * GET /api/projects
     * Get all public goods projects
     */
    getAllProjects(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/projects/categories
     * Get all project categories
     */
    getCategories(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/projects/:id
     * Get project by ID
     */
    getProjectById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /api/projects/address/:address
     * Get project by address
     */
    getProjectByAddress(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /api/projects/validate/:address
     * Check if address is an approved project
     */
    validateProject(req: Request, res: Response): Promise<void>;
}
export declare const projectsController: ProjectsController;
export {};
//# sourceMappingURL=projects.controller.d.ts.map