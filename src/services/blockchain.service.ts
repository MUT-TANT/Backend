import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, STACKSAVE_ABI, ERC20_ABI, FAUCET_ABI } from '../config/contracts';

class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  public stackSaveContract: ethers.Contract;
  public faucetContract: ethers.Contract;

  constructor() {
    // Initialize provider
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
      throw new Error('RPC_URL not configured in environment variables');
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Initialize wallet
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY not configured in environment variables');
    }

    this.wallet = new ethers.Wallet(privateKey, this.provider);

    // Initialize contracts
    this.stackSaveContract = new ethers.Contract(
      CONTRACT_ADDRESSES.STACKSAVE,
      STACKSAVE_ABI,
      this.wallet
    );

    this.faucetContract = new ethers.Contract(
      CONTRACT_ADDRESSES.TOKEN_FAUCET,
      FAUCET_ABI,
      this.wallet
    );

    console.log('✅ Blockchain service initialized');
    console.log(`📡 RPC: ${rpcUrl}`);
    console.log(`👛 Wallet: ${this.wallet.address}`);
    console.log(`📝 StackSave Contract: ${CONTRACT_ADDRESSES.STACKSAVE}`);
  }

  /**
   * Get provider instance
   */
  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  /**
   * Get wallet instance
   */
  getWallet(): ethers.Wallet {
    return this.wallet;
  }

  /**
   * Get ERC20 token contract instance
   */
  getERC20Contract(tokenAddress: string): ethers.Contract {
    return new ethers.Contract(tokenAddress, ERC20_ABI, this.wallet);
  }

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: string) {
    return await this.provider.getTransactionReceipt(txHash);
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash: string, confirmations: number = 1) {
    return await this.provider.waitForTransaction(txHash, confirmations);
  }

  /**
   * Get gas price
   */
  async getGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice || BigInt(0);
  }

  /**
   * Format ether value to human readable
   */
  formatEther(value: bigint): string {
    return ethers.formatEther(value);
  }

  /**
   * Parse ether value from string
   */
  parseEther(value: string): bigint {
    return ethers.parseEther(value);
  }

  /**
   * Format units based on decimals
   */
  formatUnits(value: bigint, decimals: number): string {
    return ethers.formatUnits(value, decimals);
  }

  /**
   * Parse units based on decimals
   */
  parseUnits(value: string, decimals: number): bigint {
    return ethers.parseUnits(value, decimals);
  }
}

// Singleton instance
export const blockchainService = new BlockchainService();
