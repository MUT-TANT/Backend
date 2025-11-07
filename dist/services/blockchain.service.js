"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockchainService = void 0;
const ethers_1 = require("ethers");
const contracts_1 = require("../config/contracts");
class BlockchainService {
    constructor() {
        // Initialize provider
        const rpcUrl = process.env.RPC_URL;
        if (!rpcUrl) {
            throw new Error('RPC_URL not configured in environment variables');
        }
        this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        // Initialize wallet
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            throw new Error('PRIVATE_KEY not configured in environment variables');
        }
        this.wallet = new ethers_1.ethers.Wallet(privateKey, this.provider);
        // Initialize contracts
        this.stackSaveContract = new ethers_1.ethers.Contract(contracts_1.CONTRACT_ADDRESSES.STACKSAVE, contracts_1.STACKSAVE_ABI, this.wallet);
        this.faucetContract = new ethers_1.ethers.Contract(contracts_1.CONTRACT_ADDRESSES.TOKEN_FAUCET, contracts_1.FAUCET_ABI, this.wallet);
        console.log('✅ Blockchain service initialized');
        console.log(`📡 RPC: ${rpcUrl}`);
        console.log(`👛 Wallet: ${this.wallet.address}`);
        console.log(`📝 StackSave Contract: ${contracts_1.CONTRACT_ADDRESSES.STACKSAVE}`);
    }
    /**
     * Get provider instance
     */
    getProvider() {
        return this.provider;
    }
    /**
     * Get wallet instance
     */
    getWallet() {
        return this.wallet;
    }
    /**
     * Get ERC20 token contract instance
     */
    getERC20Contract(tokenAddress) {
        return new ethers_1.ethers.Contract(tokenAddress, contracts_1.ERC20_ABI, this.wallet);
    }
    /**
     * Get current block number
     */
    async getBlockNumber() {
        return await this.provider.getBlockNumber();
    }
    /**
     * Get transaction receipt
     */
    async getTransactionReceipt(txHash) {
        return await this.provider.getTransactionReceipt(txHash);
    }
    /**
     * Wait for transaction confirmation
     */
    async waitForTransaction(txHash, confirmations = 1) {
        return await this.provider.waitForTransaction(txHash, confirmations);
    }
    /**
     * Get gas price
     */
    async getGasPrice() {
        const feeData = await this.provider.getFeeData();
        return feeData.gasPrice || BigInt(0);
    }
    /**
     * Format ether value to human readable
     */
    formatEther(value) {
        return ethers_1.ethers.formatEther(value);
    }
    /**
     * Parse ether value from string
     */
    parseEther(value) {
        return ethers_1.ethers.parseEther(value);
    }
    /**
     * Format units based on decimals
     */
    formatUnits(value, decimals) {
        return ethers_1.ethers.formatUnits(value, decimals);
    }
    /**
     * Parse units based on decimals
     */
    parseUnits(value, decimals) {
        return ethers_1.ethers.parseUnits(value, decimals);
    }
}
// Singleton instance
exports.blockchainService = new BlockchainService();
//# sourceMappingURL=blockchain.service.js.map