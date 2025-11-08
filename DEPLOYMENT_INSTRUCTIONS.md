# Railway Deployment - Pre-Compiled Approach

## ✅ What's Already Done

1. **TypeScript compiled** - `dist/` folder has all compiled `.js` files
2. **`.gitignore` updated** - `dist/` is now allowed to be committed
3. **`package.json`** - Only has `start` script, no build scripts

## ⚠️ Prisma Issue

There's a local permission error with `npx prisma generate`. You need to fix this before committing:

### Option 1: Close Other Programs
1. Close VS Code, Railway CLI, or any other tools accessing the Backend folder
2. Try again: `cd Backend && npx prisma generate`

### Option 2: Manual Fix
1. Delete the `.prisma` folder: `rm -rf node_modules/.prisma`
2. Run: `npm install`
3. Run: `npx prisma generate`

### Option 3: Skip Prisma for Now
Railway will try to run `npm install` which should generate Prisma automatically. The chmod fix might work there.

## 🚀 Deploy to Railway

Once Prisma is generated locally (or you skip it):

```bash
cd Backend

# Add all files including dist/
git add .

# Commit
git commit -m "Deploy with pre-compiled dist folder"

# Push to Railway
git push
```

## What Railway Will Do

```
1. npm install (installs dependencies + may generate Prisma)
2. npm start (runs node dist/server.js)
3. ✅ SUCCESS
```

## If It Still Fails on Railway

### Check Railway Logs For:

**If you see: "Cannot find module './routes/projects.routes'"**
- The dist folder wasn't committed properly
- Run: `git add dist/ --force`
- Commit and push again

**If you see: "Cannot find module '@prisma/client'"**
- Prisma didn't generate on Railway
- Go to Railway Dashboard → Settings → Deploy
- Set Start Command: `npx prisma generate && node dist/server.js`

**If you see: "Database connection failed"**
- Environment variables not set
- Go to Railway → Variables
- Add all variables from your local `.env` file

## Environment Variables Checklist

Make sure these are ALL set in Railway Dashboard → Variables:

```
✓ DATABASE_URL
✓ DIRECT_URL
✓ RPC_URL
✓ PRIVATE_KEY
✓ STACKSAVE_CONTRACT
✓ YIELD_ROUTER_CONTRACT
✓ USDC_VAULT
✓ DAI_VAULT
✓ WETH_VAULT
✓ TOKEN_FAUCET
✓ USDC_ADDRESS
✓ DAI_ADDRESS
✓ WETH_ADDRESS
✓ NODE_ENV=production
✓ API_VERSION=v1
✓ CORS_ORIGIN=*
✓ CHAIN_ID=8
```

## Test After Deployment

```bash
# Test health endpoint
curl https://your-railway-app.up.railway.app/health

# Expected response:
{
  "status": "healthy",
  "database": "connected",
  ...
}
```

## Future Updates

Every time you make code changes:
1. Make your changes in `src/`
2. Run: `npx tsc` (compile TypeScript)
3. Commit both `src/` and `dist/` changes
4. Push to Railway

This approach avoids ALL Railway build permission issues!
