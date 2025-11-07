import { ethers } from 'ethers';
declare class BlockchainService {
    private provider;
    private wallet;
    stackSaveContract: ethers.Contract;
    faucetContract: ethers.Contract;
    constructor();
    /**
     * Get provider instance
     */
    getProvider(): ethers.JsonRpcProvider;
    /**
     * Get wallet instance
     */
    getWallet(): ethers.Wallet;
    /**
     * Get ERC20 token contract instance
     */
    getERC20Contract(tokenAddress: string): ethers.Contract;
    /**
     * Get current block number
     */
    getBlockNumber(): Promise<number>;
    /**
     * Get transaction receipt
     */
    getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null>;
    /**
     * Wait for transaction confirmation
     */
    waitForTransaction(txHash: string, confirmations?: number): Promise<ethers.TransactionReceipt | null>;
    /**
     * Get gas price
     */
    getGasPrice(): Promise<bigint>;
    /**
     * Format ether value to human readable
     */
    formatEther(value: bigint): string;
    /**
     * Parse ether value from string
     */
    parseEther(value: string): bigint;
    /**
     * Format units based on decimals
     */
    formatUnits(value: bigint, decimals: number): string;
    /**
     * Parse units based on decimals
     */
    parseUnits(value: string, decimals: number): bigint;
}
export declare const blockchainService: BlockchainService;
export {};
//# sourceMappingURL=blockchain.service.d.ts.map