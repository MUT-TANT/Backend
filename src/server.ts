import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import goalsRoutes from './routes/goals.routes';
import usersRoutes from './routes/users.routes';
import faucetRoutes from './routes/faucet.routes';
import projectsRoutes from './routes/projects.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Initialize Express app
const app: Application = express();
const PORT = Number(process.env.PORT) || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: API_VERSION,
  });
});

// API Routes
app.use(`/api/${API_VERSION}/goals`, goalsRoutes);
app.use(`/api/${API_VERSION}/users`, usersRoutes);
app.use(`/api/${API_VERSION}/faucet`, faucetRoutes);
app.use(`/api/${API_VERSION}/projects`, projectsRoutes);

// For backward compatibility, also support routes without version
app.use('/api/goals', goalsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/faucet', faucetRoutes);
app.use('/api/projects', projectsRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server only in development mode (not on Vercel serverless)
if (process.env.NODE_ENV !== 'production') {
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

export default app;
