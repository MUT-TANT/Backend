"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables FIRST before any other imports
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const goals_routes_1 = __importDefault(require("./routes/goals.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const faucet_routes_1 = __importDefault(require("./routes/faucet.routes"));
const projects_routes_1 = __importDefault(require("./routes/projects.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const client_1 = require("@prisma/client");
// Initialize Prisma Client
const prisma = new client_1.PrismaClient();
// Initialize Express app
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Health check endpoint with database status
app.get('/health', async (req, res) => {
    try {
        // Test database connection
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: API_VERSION,
            database: 'connected',
            environment: process.env.NODE_ENV || 'development',
        });
    }
    catch (error) {
        console.error('❌ Health check failed - Database error:', error.message);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            version: API_VERSION,
            database: 'disconnected',
            error: error.message,
        });
    }
});
// API Routes
app.use(`/api/${API_VERSION}/goals`, goals_routes_1.default);
app.use(`/api/${API_VERSION}/users`, users_routes_1.default);
app.use(`/api/${API_VERSION}/faucet`, faucet_routes_1.default);
app.use(`/api/${API_VERSION}/projects`, projects_routes_1.default);
// For backward compatibility, also support routes without version
app.use('/api/goals', goals_routes_1.default);
app.use('/api/users', users_routes_1.default);
app.use('/api/faucet', faucet_routes_1.default);
app.use('/api/projects', projects_routes_1.default);
// 404 handler
app.use(errorHandler_1.notFoundHandler);
// Error handler (must be last)
app.use(errorHandler_1.errorHandler);
// Test database connection on startup
async function testDatabaseConnection() {
    try {
        console.log('🔍 Testing database connection...');
        await prisma.$connect();
        await prisma.$queryRaw `SELECT 1`;
        console.log('✅ Database connected successfully');
        return true;
    }
    catch (error) {
        console.error('');
        console.error('❌ DATABASE CONNECTION FAILED');
        console.error('================================');
        console.error('Error:', error.message);
        console.error('');
        console.error('Please check:');
        console.error('  1. DATABASE_URL is set correctly');
        console.error('  2. Database is accessible from this network');
        console.error('  3. Database credentials are valid');
        console.error('================================');
        console.error('');
        return false;
    }
}
// Start server
async function startServer() {
    // Test database before starting server
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
        console.log('⚠️  Starting server anyway (database features will fail)');
    }
    app.listen(PORT, () => {
        console.log('');
        console.log('🚀 StackSave Backend Server');
        console.log('================================');
        console.log(`📡 Server running on port ${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📝 API Version: ${API_VERSION}`);
        console.log(`🔗 RPC URL: ${process.env.RPC_URL}`);
        console.log(`📋 Contract: ${process.env.STACKSAVE_CONTRACT}`);
        console.log('');
        console.log('Available endpoints:');
        console.log(`  GET  /health`);
        console.log(`  POST /api/goals`);
        console.log(`  GET  /api/goals/:goalId`);
        console.log(`  GET  /api/users/:address/goals`);
        console.log(`  POST /api/goals/:goalId/deposit`);
        console.log(`  POST /api/goals/:goalId/withdraw`);
        console.log(`  POST /api/goals/:goalId/withdraw-early`);
        console.log(`  GET  /api/goals/currencies/list`);
        console.log(`  POST /api/faucet/claim`);
        console.log(`  GET  /api/faucet/can-claim/:address/:tokenAddress`);
        console.log(`  GET  /api/faucet/balance/:address/:tokenAddress`);
        console.log(`  GET  /api/projects`);
        console.log(`  GET  /api/projects/categories`);
        console.log(`  GET  /api/projects/:id`);
        console.log('================================');
        console.log('');
    });
}
// Start the server
startServer().catch((error) => {
    console.error('❌ Fatal error starting server:', error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=server.js.map