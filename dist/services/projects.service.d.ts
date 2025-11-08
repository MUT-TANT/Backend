export interface PublicGoodsProject {
    id: string;
    address: string;
    name: string;
    description: string;
    category: string;
    website?: string;
    image?: string;
    supportersCount: number;
    totalDonated: string;
}
declare class ProjectsService {
    /**
     * Get all approved public goods projects
     */
    getAllProjects(): PublicGoodsProject[];
    /**
     * Get project by ID
     */
    getProjectById(id: string): PublicGoodsProject | null;
    /**
     * Get project by address
     */
    getProjectByAddress(address: string): PublicGoodsProject | null;
    /**
     * Get all unique categories
     */
    getCategories(): string[];
    /**
     * Get projects by category
     */
    getProjectsByCategory(category: string): PublicGoodsProject[];
    /**
     * Search projects by name or description
     */
    searchProjects(query: string): PublicGoodsProject[];
    /**
     * Check if an address is an approved project
     */
    isApprovedProject(address: string): boolean;
    /**
     * Get approved project addresses (for smart contract validation)
     */
    getApprovedAddresses(): string[];
}
export declare const projectsService: ProjectsService;
export {};
//# sourceMappingURL=projects.service.d.ts.map