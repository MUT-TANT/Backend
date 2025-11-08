"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ethers_1 = require("ethers");
const FAUCET_ADDRESS = process.env.TOKEN_FAUCET || '';
const DAI_ADDRESS = process.env.DAI_ADDRESS || '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const USDC_ADDRESS = process.env.USDC_ADDRESS || '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const WETH_ADDRESS = process.env.WETH_ADDRESS || '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const RPC_URL = process.env.RPC_URL || '';
const ERC20_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)',
];
async function checkFaucetBalances() {
    console.log('🔍 Checking Token Faucet Balances');
    console.log('================================================\n');
    if (!RPC_URL) {
        console.error('❌ RPC_URL not configured in .env');
        process.exit(1);
    }
    if (!FAUCET_ADDRESS) {
        console.error('❌ TOKEN_FAUCET not configured in .env');
        process.exit(1);
    }
    console.log(`📍 Faucet Address: ${FAUCET_ADDRESS}`);
    console.log(`📡 RPC URL: ${RPC_URL}\n`);
    try {
        const provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL);
        console.log('✅ Connected to RPC\n');
        // Check ETH balance
        console.log('💰 ETH Balance:');
        const ethBalance = await provider.getBalance(FAUCET_ADDRESS);
        const ethFormatted = ethers_1.ethers.formatEther(ethBalance);
        console.log(`   ${ethFormatted} ETH`);
        if (parseFloat(ethFormatted) >= 10) {
            console.log('   ✅ Has 10+ ETH\n');
        }
        else {
            console.log(`   ⚠️  Only has ${ethFormatted} ETH (need 10 ETH)\n`);
        }
        // Check token balances
        const tokens = [
            { name: 'DAI', address: DAI_ADDRESS },
            { name: 'USDC', address: USDC_ADDRESS },
            { name: 'WETH', address: WETH_ADDRESS },
        ];
        for (const token of tokens) {
            try {
                console.log(`💵 ${token.name} Balance:`);
                const tokenContract = new ethers_1.ethers.Contract(token.address, ERC20_ABI, provider);
                const [balance, decimals, symbol] = await Promise.all([
                    tokenContract.balanceOf(FAUCET_ADDRESS),
                    tokenContract.decimals(),
                    tokenContract.symbol(),
                ]);
                const balanceFormatted = ethers_1.ethers.formatUnits(balance, decimals);
                console.log(`   ${balanceFormatted} ${symbol}`);
                console.log(`   Address: ${token.address}`);
                const balanceNum = parseFloat(balanceFormatted);
                if (balanceNum >= 10000) {
                    console.log('   ✅ Has 10,000+ tokens\n');
                }
                else if (balanceNum >= 1000) {
                    console.log(`   ⚠️  Has ${balanceNum.toLocaleString()} tokens (good for testing)\n`);
                }
                else if (balanceNum > 0) {
                    console.log(`   ⚠️  Only has ${balanceNum.toLocaleString()} tokens (may need more)\n`);
                }
                else {
                    console.log(`   ❌ EMPTY - No ${symbol} in faucet!\n`);
                }
            }
            catch (error) {
                console.log(`   ❌ Error reading ${token.name}: ${error.message}\n`);
            }
        }
        console.log('================================================');
        console.log('📋 SUMMARY:\n');
        const ethNum = parseFloat(ethFormatted);
        if (ethNum >= 10) {
            console.log('✅ Faucet has sufficient ETH');
        }
        else {
            console.log(`⚠️  Faucet needs more ETH (has ${ethFormatted}, need 10)`);
        }
        console.log('\n💡 To claim from faucet:');
        console.log('   1. Use mobile app → Faucet section');
        console.log('   2. Or call: POST /api/faucet/claim');
        console.log('      {"tokenAddress": "<DAI_ADDRESS>"}');
        console.log('\n📝 If faucet is empty, you need to fund it:');
        console.log('   Option 1: Transfer tokens from another address');
        console.log('   Option 2: Use Tenderly to override balances');
        console.log('   Option 3: Fork from a block where faucet had funds');
        console.log('================================================\n');
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}
checkFaucetBalances();
//# sourceMappingURL=checkFaucet.js.map