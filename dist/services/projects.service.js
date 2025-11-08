"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectsService = void 0;
// Octant-approved public goods projects
const APPROVED_PROJECTS = [
    {
        id: 'octant-general',
        address: '0x00d1e028A70ee8D422bFD1132B50464E2D21FBcD',
        name: 'Octant General Pool',
        description: 'Support all Octant public goods projects. Your donation is distributed across the entire ecosystem.',
        category: 'General',
        website: 'https://octant.app',
        supportersCount: 1234,
        totalDonated: '125000',
    },
    {
        id: 'gitcoin',
        address: '0xde21F729137C5Af1b01d73aF1dC21eFfa2B8a0d6',
        name: 'Gitcoin',
        description: 'Funding open source software development and public goods through quadratic funding.',
        category: 'Open Source',
        website: 'https://gitcoin.co',
        supportersCount: 892,
        totalDonated: '89000',
    },
    {
        id: 'protocol-labs',
        address: '0x4200000000000000000000000000000000000042',
        name: 'Protocol Labs',
        description: 'Building breakthrough internet protocols like IPFS and Filecoin for a decentralized web.',
        category: 'Infrastructure',
        website: 'https://protocol.ai',
        supportersCount: 654,
        totalDonated: '67500',
    },
    {
        id: 'ethereum-foundation',
        address: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
        name: 'Ethereum Foundation',
        description: 'Supporting Ethereum protocol development and ecosystem growth.',
        category: 'Infrastructure',
        website: 'https://ethereum.foundation',
        supportersCount: 1456,
        totalDonated: '234000',
    },
    {
        id: 'climate-collective',
        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        name: 'Climate Collective',
        description: 'Funding climate solutions and regenerative finance projects through blockchain technology.',
        category: 'Climate',
        supportersCount: 432,
        totalDonated: '45000',
    },
    {
        id: 'kernel-community',
        address: '0x0D5Dc686d0a2ABBfDaFDFb4D0533E886517d4E83',
        name: 'Kernel Community',
        description: 'Educational community building better web3 products and fostering collaboration.',
        category: 'Education',
        website: 'https://kernel.community',
        supportersCount: 567,
        totalDonated: '56700',
    },
    {
        id: 'giveth',
        address: '0x6C9FC64A53c1b71FB3f9Af64d1ae3A890a96C8a9',
        name: 'Giveth',
        description: 'Building the future of giving using blockchain technology to create transparent donation systems.',
        category: 'Philanthropy',
        website: 'https://giveth.io',
        supportersCount: 321,
        totalDonated: '34500',
    },
    {
        id: 'optimism-collective',
        address: '0x4200000000000000000000000000000000000019',
        name: 'Optimism Collective',
        description: 'Supporting public goods funding through retroactive funding and RetroPGF.',
        category: 'Infrastructure',
        website: 'https://optimism.io',
        supportersCount: 789,
        totalDonated: '123000',
    },
];
class ProjectsService {
    /**
     * Get all approved public goods projects
     */
    getAllProjects() {
        return APPROVED_PROJECTS;
    }
    /**
     * Get project by ID
     */
    getProjectById(id) {
        const project = APPROVED_PROJECTS.find(p => p.id === id);
        return project || null;
    }
    /**
     * Get project by address
     */
    getProjectByAddress(address) {
        const project = APPROVED_PROJECTS.find(p => p.address.toLowerCase() === address.toLowerCase());
        return project || null;
    }
    /**
     * Get all unique categories
     */
    getCategories() {
        const categories = new Set(APPROVED_PROJECTS.map(p => p.category));
        return Array.from(categories).sort();
    }
    /**
     * Get projects by category
     */
    getProjectsByCategory(category) {
        return APPROVED_PROJECTS.filter(p => p.category === category);
    }
    /**
     * Search projects by name or description
     */
    searchProjects(query) {
        const lowerQuery = query.toLowerCase();
        return APPROVED_PROJECTS.filter(p => p.name.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery));
    }
    /**
     * Check if an address is an approved project
     */
    isApprovedProject(address) {
        return APPROVED_PROJECTS.some(p => p.address.toLowerCase() === address.toLowerCase());
    }
    /**
     * Get approved project addresses (for smart contract validation)
     */
    getApprovedAddresses() {
        return APPROVED_PROJECTS.map(p => p.address);
    }
}
// Export singleton instance
exports.projectsService = new ProjectsService();
//# sourceMappingURL=projects.service.js.map