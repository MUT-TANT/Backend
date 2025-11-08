# Railway Deployment - Prisma Template Approach

## Files Created for Railway

1. **Procfile** - Tells Railway how to start the app
2. **nixpacks.toml** - Explicit build configuration
3. **Updated package.json** - Clean scripts without npx

## Current Configuration

### Build Flow
```
1. Setup Phase: Install Node.js 18
2. Install Phase: npm install
3. Build Phase: npx prisma generate
4. Start Phase: npm start (runs ts-node)
```

### If Build Still Fails

If you're still getting `sh: 1: prisma: Permission denied`, try these Railway-specific steps:

## Option 1: Use Railway Dashboard Settings

Instead of relying on files, configure directly in Railway:

1. Go to your Railway project
2. Click on Settings → Deploy
3. Set these values:
   - **Build Command**: Leave EMPTY or set to `echo "Skipping build"`
   - **Start Command**: `npx prisma generate && npx ts-node src/server.ts`
   - **Watch Paths**: `src/**`

This bypasses the Docker build phase entirely and runs everything at start time.

## Option 2: Deploy from Railway Template

1. Create a NEW Railway project
2. Choose "Deploy from Template" → Search for "Prisma"
3. Use the official Railway Prisma starter
4. Copy your code INTO that template
5. Add your environment variables

## Option 3: Use Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Set environment variables
railway variables set DATABASE_URL="your-url"
railway variables set DIRECT_URL="your-url"
# ... set all other variables

# Deploy
railway up
```

## Required Environment Variables on Railway

Make sure ALL these are set in Railway Dashboard → Variables:

```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
RPC_URL=https://virtual.mainnet.eu.rpc.tenderly.co/...
PRIVATE_KEY=0x...
STACKSAVE_CONTRACT=0x...
YIELD_ROUTER_CONTRACT=0x...
USDC_VAULT=0x...
DAI_VAULT=0x...
WETH_VAULT=0x...
TOKEN_FAUCET=0x...
USDC_ADDRESS=0x...
DAI_ADDRESS=0x...
WETH_ADDRESS=0x...
NODE_ENV=production
API_VERSION=v1
CORS_ORIGIN=*
CHAIN_ID=8
```

## Debugging Steps

### 1. Check Railway Build Logs
Look for the exact error message. If you see:
- `prisma: Permission denied` → Try Option 1 (skip build phase)
- `Cannot find module '@prisma/client'` → Prisma didn't generate
- `ECONNREFUSED` → Database connection issue

### 2. Test Locally with Same Setup
```bash
cd Backend
rm -rf node_modules
npm install
npx prisma generate
npm start
```

If this works locally but fails on Railway, it's a Railway environment issue.

### 3. Check Prisma Binary
Railway might need the binary explicitly:

Add to `prisma/schema.prisma`:
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

Then regenerate locally and push.

### 4. Use Railway's PostgreSQL
Instead of external Supabase:
1. Add PostgreSQL plugin in Railway dashboard
2. Railway auto-sets DATABASE_URL
3. No need for DIRECT_URL

## Alternative: Deploy to Different Platform

If Railway continues to fail, try:

### Render.com
```yaml
# render.yaml
services:
  - type: web
    name: stacksave-backend
    env: node
    buildCommand: npm install && npx prisma generate
    startCommand: npm start
```

### Vercel
Vercel supports TypeScript natively but is better for serverless.

### Heroku
```
# Procfile
web: npm start
release: npx prisma generate
```

## Contact Railway Support

If none of this works, it might be a Railway platform issue. Contact them at:
- Discord: https://discord.gg/railway
- Email: team@railway.app

Provide:
- Your build logs
- The exact error message
- That you're using Prisma with TypeScript
