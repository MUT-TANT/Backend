# Railway Deployment Guide for StackSave Backend

## Prerequisites
- Railway account created
- Supabase database set up
- All contract addresses deployed on Tenderly Fork

## Step 1: Configure Environment Variables on Railway

Go to your Railway project settings → Variables tab and add the following:

### Critical Variables (Required)
```env
# Database
DATABASE_URL=postgresql://postgres.dqbmenxnonblnkgiiecz:123451@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=15
DIRECT_URL=postgresql://postgres.dqbmenxnonblnkgiiecz:123451@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres

# Blockchain
RPC_URL=https://virtual.mainnet.eu.rpc.tenderly.co/82c86106-662e-4d7f-a974-c311987358ff
PRIVATE_KEY=0xea892dc096c570a7de3c8dc38f3f13cf3f61504d3b8773f102903a8b475f2e2c

# Contract Addresses
STACKSAVE_CONTRACT=0x958d2996da3A0D07eA38b39Cb39f2c91Fca54727
YIELD_ROUTER_CONTRACT=0x2dF68f12b49358f3B768bf1944Dc86EDf68345Da
USDC_VAULT=0xe8971d0Fe75D14F34dE8669CEB0B915CEF4A909e
DAI_VAULT=0x98483649e603C9A1837cEDB1B7A251FA684a81C5
WETH_VAULT=0x54B2ae72038e3E9ef1Cfd39D867181B6f66cdEF9
TOKEN_FAUCET=0xb42847c1EE86B92Ca1fe9a25f18Af4CF065a5511

# Token Addresses
USDC_ADDRESS=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
DAI_ADDRESS=0x6B175474E89094C44Da98b954EedeAC495271d0F
WETH_ADDRESS=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
```

### Optional Variables (Have Defaults)
```env
NODE_ENV=production
API_VERSION=v1
CORS_ORIGIN=*
CHAIN_ID=8
```

## Step 2: Deploy Settings

Railway should auto-detect the configuration from `railway.json`, but verify:

### Build Settings
- **Build Command**: Leave empty (uses default npm install + postinstall hook)
- **Install Command**: `npm install`

### Deploy Settings
- **Start Command**: `npm start` (configured in railway.json)
- **Restart Policy**: ON_FAILURE with 10 max retries

## Step 3: Deploy

1. Push your code to the connected GitHub repository
2. Railway will automatically trigger a deployment
3. Monitor the build logs for any errors

## Step 4: Verify Deployment

### Check Build Logs
Look for these success messages:
```
✅ Database connected successfully
🚀 StackSave Backend Server
📡 Server running on port XXXX
```

### Test Health Endpoint
```bash
curl https://your-railway-app.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-08T...",
  "version": "v1",
  "database": "connected",
  "environment": "production"
}
```

### Test API Endpoints
```bash
# Test getting user goals
curl https://your-railway-app.up.railway.app/api/users/0x00d1e028a70ee8d422bfd1132b50464e2d21fbcd/goals

# Test projects endpoint
curl https://your-railway-app.up.railway.app/api/projects
```

## Common Issues & Solutions

### Issue 1: 502 Bad Gateway
**Symptoms**: All API calls return 502 error

**Possible Causes**:
- Database connection failed
- Environment variables not set
- App crashed on startup

**Solution**:
1. Check Railway logs for error messages
2. Verify DATABASE_URL and DIRECT_URL are set correctly
3. Test the health endpoint
4. Check if Supabase allows connections from Railway IPs

### Issue 2: Build Fails with "prisma: Permission denied"
**Symptoms**: Build fails during npm run build

**Solution**:
This should be fixed with the new configuration:
- Build script now only runs `npx prisma generate`
- Start script uses `ts-node` directly (no compilation)
- `postinstall` hook automatically generates Prisma client

### Issue 3: Database Connection Timeout
**Symptoms**: Health check shows "database: disconnected"

**Solution**:
1. Verify Supabase database is running
2. Check connection string format
3. Ensure Railway can reach Supabase (check firewall/network settings)
4. Try increasing connect_timeout in DATABASE_URL

### Issue 4: Environment Variables Not Loading
**Symptoms**: Logs show undefined for contract addresses

**Solution**:
1. Go to Railway project → Variables tab
2. Verify all environment variables are set
3. Click "Redeploy" to restart with new variables

## Deployment Flow

```
Railway Deployment Flow:
1. Git push triggers deployment
2. Railway runs: npm install
3. Postinstall hook runs: npx prisma generate
4. Railway runs start command: npm start
5. Start script runs: npx ts-node src/server.ts
6. Server tests database connection on startup
7. Server starts listening on PORT
8. Health endpoint available at /health
```

## Testing Checklist

- [ ] Health endpoint returns 200
- [ ] Database status is "connected"
- [ ] Can create a new goal via POST /api/goals
- [ ] Can retrieve user goals via GET /api/users/:address/goals
- [ ] Can claim from faucet via POST /api/faucet/claim
- [ ] Can get projects via GET /api/projects
- [ ] Mobile app can connect and fetch data

## Updating the Deployment

To update your Railway deployment:

1. Make changes to your code locally
2. Test locally with `npm run dev`
3. Commit and push to GitHub
4. Railway automatically redeploys
5. Monitor build logs for success/failure

## Rollback

If a deployment fails:

1. Go to Railway dashboard → Deployments tab
2. Click on a previous successful deployment
3. Click "Redeploy" to rollback

## Support

If you continue to have issues:

1. Check Railway logs: Dashboard → Logs tab
2. Check Supabase logs: Supabase Dashboard → Logs
3. Verify all environment variables match your .env file
4. Test database connection from local machine
5. Contact Railway support if infrastructure issue

## Mobile App Configuration

Update your Flutter app's `.env` file:
```env
API_BASE_URL=https://your-railway-app.up.railway.app/api
```

Replace `your-railway-app.up.railway.app` with your actual Railway domain.
