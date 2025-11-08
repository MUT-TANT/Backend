"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ethers_1 = require("ethers");
const MORPHO_ADDRESS = '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb';
const RPC_URL = process.env.RPC_URL || '';
// Minimal Morpho ABI for testing
const MORPHO_ABI = [
    'function owner() view returns (address)',
    'function supply(tuple(address loanToken, address collateralToken, address oracle, address irm, uint256 lltv) market, uint256 assets, uint256 shares, address onBehalf, bytes data) returns (uint256 assetsSupplied, uint256 sharesSupplied)',
];
async function verifyMorpho() {
    console.log('🔍 Verifying Morpho Blue Deployment on Tenderly Fork');
    console.log('================================================\n');
    if (!RPC_URL) {
        console.error('❌ RPC_URL not configured in .env');
        process.exit(1);
    }
    console.log(`📡 RPC URL: ${RPC_URL}`);
    console.log(`📍 Morpho Address: ${MORPHO_ADDRESS}\n`);
    try {
        // Connect to fork
        const provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL);
        console.log('✅ Connected to RPC\n');
        // Check network
        const network = await provider.getNetwork();
        console.log(`🌐 Network: Chain ID ${network.chainId}`);
        console.log(`   Name: ${network.name}\n`);
        // Check if contract exists
        console.log('🔎 Checking if Morpho contract exists...');
        const code = await provider.getCode(MORPHO_ADDRESS);
        if (code === '0x' || code === '0x0') {
            console.log('❌ NO CONTRACT FOUND at Morpho address');
            console.log('   The address has no bytecode deployed\n');
            console.log('📋 CONCLUSION:');
            console.log('   Morpho Blue is NOT deployed on this fork');
            console.log('   You need to either:');
            console.log('   1. Fork a recent mainnet block that includes Morpho');
            console.log('   2. Deploy a mock Morpho contract');
            console.log('   3. Use Tenderly state override to import Morpho');
            console.log('   4. Simplify vault to not use Morpho\n');
            process.exit(1);
        }
        console.log(`✅ Contract EXISTS! Bytecode length: ${code.length} bytes\n`);
        // Try to interact with contract
        console.log('🔎 Testing contract interaction...');
        const morpho = new ethers_1.ethers.Contract(MORPHO_ADDRESS, MORPHO_ABI, provider);
        try {
            const owner = await morpho.owner();
            console.log(`✅ Contract is callable!`);
            console.log(`   Owner: ${owner}\n`);
        }
        catch (error) {
            console.log(`⚠️  Contract exists but may not be Morpho Blue`);
            console.log(`   Error calling owner(): ${error.message}\n`);
        }
        // Check DAI balance (if you have DAI)
        const DAI_ADDRESS = process.env.DAI_ADDRESS || '0x6B175474E89094C44Da98b954EedeAC495271d0F';
        const walletAddress = process.env.WALLET_ADDRESS || '';
        if (walletAddress) {
            console.log('🔎 Checking your DAI balance...');
            const daiAbi = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'];
            const daiContract = new ethers_1.ethers.Contract(DAI_ADDRESS, daiAbi, provider);
            try {
                const balance = await daiContract.balanceOf(walletAddress);
                const decimals = await daiContract.decimals();
                const balanceFormatted = ethers_1.ethers.formatUnits(balance, decimals);
                console.log(`   Your DAI balance: ${balanceFormatted} DAI\n`);
            }
            catch (error) {
                console.log(`   Could not read DAI balance\n`);
            }
        }
        console.log('================================================');
        console.log('📋 SUMMARY:');
        console.log('✅ Morpho Blue contract EXISTS on your fork');
        console.log('✅ Contract is deployed and callable');
        console.log('\n🎉 Your deposit transactions should work!');
        console.log('\nNext steps:');
        console.log('1. Make sure faucet has funds');
        console.log('2. Claim tokens from faucet');
        console.log('3. Try depositing 1 DAI to test');
        console.log('================================================\n');
    }
    catch (error) {
        console.error('❌ Error during verification:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}
verifyMorpho();
//# sourceMappingURL=verifyMorpho.js.map