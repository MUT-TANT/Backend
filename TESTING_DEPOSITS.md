# Testing Deposit/Staking Transactions on Tenderly Fork

## Step 1: Verify Morpho Blue Exists on Fork

Run the verification script:

```bash
cd Backend
npm run verify-morpho
```

### Possible Outcomes:

#### ✅ Success: Morpho Exists
```
✅ Contract EXISTS! Bytecode length: XXXX bytes
✅ Contract is callable!
   Owner: 0x...

📋 SUMMARY:
✅ Morpho Blue contract EXISTS on your fork
✅ Contract is deployed and callable

🎉 Your deposit transactions should work!
```

**If you see this:** Your fork is ready! Skip to Step 3.

#### ❌ Morpho Not Found
```
❌ NO CONTRACT FOUND at Morpho address
   The address has no bytecode deployed

📋 CONCLUSION:
   Morpho Blue is NOT deployed on this fork
```

**If you see this:** You need to choose a solution (see Step 2).

---

## Step 2: If Morpho Doesn't Exist (Solutions)

### Option B: Deploy Mock Morpho
I can create a simplified mock Morpho contract that:
- Accepts deposits
- Returns shares
- Doesn't generate real yield

**Pros:** Fast, guaranteed to work
**Cons:** Not real Morpho integration

### Option C: Use Tenderly State Override
1. Go to your Tenderly dashboard
2. Fork a recent mainnet block (after Morpho was deployed)
3. Ensure state includes Morpho Blue contract
4. Update your fork RPC URL

**Pros:** Real Morpho, most accurate testing
**Cons:** Requires Tenderly account configuration

### Option D: Simplify Vault
Modify `MorphoVaultAdapter.sol` to:
- Remove `_supplyToMorpho()` call
- Just hold tokens in vault
- Skip external staking

**Pros:** Quick code fix, works immediately
**Cons:** Not demonstrating Morpho integration

---

## Step 3: Test Deposit Flow

Once Morpho is verified (or mock deployed):

### 3.1 Make sure faucet has funds
```bash
# Check faucet balance
npm run check-contract
```

### 3.2 Claim tokens from faucet

**Via Mobile App:**
1. Open app
2. Go to Profile/Faucet section
3. Tap "Claim 1000 USDC" or "Claim 1000 DAI"

**Or via Backend API:**
```bash
curl -X POST http://localhost:3000/api/faucet/claim \
  -H "Content-Type: application/json" \
  -d '{"tokenAddress": "0x6B175474E89094C44Da98b954EedeAC495271d0F"}'
```

### 3.3 Create a Goal

**Via Mobile App:**
1. Tap "Add New Goal"
2. Enter goal details:
   - Name: "Test Goal"
   - Target: $100
   - Timeframe: 30 days
3. Submit

**Goal will be created in database AND on blockchain**

### 3.4 Deposit Tokens

**Via Mobile App:**
1. Go to "Add Saving" tab
2. Select your goal from dropdown
3. Enter amount: `1` (1 DAI for testing)
4. Select payment method: Wallet
5. Tap "Proceed"

**What happens:**
```
1. Backend calls contractService.deposit(goalId, "1")
2. Backend approves StackSave to spend 1 DAI
3. Backend calls StackSave.deposit(goalId, 1 DAI)
4. StackSave transfers DAI from backend wallet
5. StackSave calls vault.deposit(1 DAI, address(this))
6. Vault mints shares to StackSave
7. Vault calls MORPHO.supply(...) ← THIS IS THE STAKING
8. Transaction succeeds ✅
9. Database updated with new balances
10. Mobile shows success dialog with txHash
```

### 3.5 Verify Deposit Success

**Check Tenderly Dashboard:**
- Go to your fork in Tenderly
- View recent transactions
- Look for transaction with your StackSave contract
- Check trace to see Morpho interaction

**Check Mobile App:**
- Goal should show updated "Saved" amount
- Current value should reflect deposit
- Transaction hash displayed in success dialog

**Check Database:**
```bash
npm run check-db
```

---

## Step 4: Monitor Transaction on Tenderly

1. Copy transaction hash from success dialog
2. Go to: `https://dashboard.tenderly.co/tx/{txHash}`
3. View:
   - Transaction details
   - Function calls
   - State changes
   - Events emitted

**Expected Events:**
```
1. Transfer (DAI from backend to StackSave)
2. Approval (StackSave approves vault)
3. Transfer (DAI from StackSave to vault)
4. Deposit (ERC-4626 vault event)
5. Supply (Morpho Blue event) ← Confirms staking worked
6. Deposited (StackSave event)
```

---

## Troubleshooting

### Error: "Morpho market not found"
**Solution:** The market parameters (oracle, IRM) don't match any market on Morpho. You need to either:
1. Use real mainnet market params
2. Deploy mock Morpho with accepting any market

### Error: "Insufficient allowance"
**Solution:** Backend wallet didn't approve tokens. Check:
- Backend wallet has DAI balance
- Approval transaction succeeded

### Error: "Insufficient balance"
**Solution:** Backend wallet doesn't have enough DAI. Either:
- Fund backend wallet manually
- Or claim from faucet to backend address

### Error: "Goal not found"
**Solution:** Goal wasn't created successfully. Check:
- Goal creation transaction succeeded
- Database has goal record
- Goal ID matches what you're depositing to

---

## Current Configuration

From your `.env`:
```
RPC_URL=https://virtual.mainnet.eu.rpc.tenderly.co/82c86106-662e-4d7f-a974-c311987358ff
CHAIN_ID=8
STACKSAVE_CONTRACT=0x958d2996da3A0D07eA38b39Cb39f2c91Fca54727
DAI_VAULT=0x98483649e603C9A1837cEDB1B7A251FA684a81C5
DAI_ADDRESS=0x6B175474E89094C44Da98b954EedeAC495271d0F
```

**Morpho Blue Address (expected):**
```
0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb
```

---

## Next Steps After Successful Deposit

1. **Test withdrawal:**
   - Wait for goal to complete OR
   - Test early withdrawal (2% penalty)

2. **Test yield accrual:**
   - Wait some time
   - Call `getGoalDetails()` to see if `currentValue` > `depositedAmount`

3. **Test donations:**
   - Yield should be split according to donation percentage
   - 5% goes to selected public goods project

4. **Test streak tracking:**
   - Deposit daily
   - Check if streak increments

---

## Important Notes

⚠️ **Custodial Wallet:** The backend uses its own private key to sign transactions, not the user's wallet. This is NOT ideal for production DeFi but works for hackathon demo.

⚠️ **Mainnet Fork:** You're using a Tenderly fork of mainnet, so all token addresses are mainnet addresses. Make sure the fork includes those contracts.

⚠️ **Gas:** Transactions on the fork don't cost real ETH, but you still need ETH in the backend wallet for gas.

---

## Summary

**Before deposits work, you need:**
1. ✅ Morpho Blue deployed on fork (verify with script)
2. ✅ Faucet loaded with tokens
3. ✅ Backend wallet has ETH for gas
4. ✅ Contracts deployed (StackSave, vaults, etc.)

**Run this to check everything:**
```bash
npm run verify-morpho
npm run check-contract
```

**Then test deposit with mobile app or API calls.**
