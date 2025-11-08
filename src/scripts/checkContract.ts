import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkContractState() {
  console.log('========================================');
  console.log('CHECKING CONTRACT STATE');
  console.log('========================================\n');

  // Initialize provider
  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) {
    throw new Error('RPC_URL not configured');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  console.log(`📡 RPC: ${rpcUrl}\n`);

  // Initialize wallet
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY not configured');
  }

  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`👛 Wallet: ${wallet.address}\n`);

  // Contract address
  const contractAddress = process.env.STACKSAVE_CONTRACT || '0xa9EDF625508bE4AcE93d3013B0cC4A5c3BD69F1a';
  console.log(`📝 Contract: ${contractAddress}\n`);

  // Contract ABI
  const abi = [
    'function getSupportedCurrencies() view returns (address[])',
    'function owner() view returns (address)',
    'function goalCounter() view returns (uint256)',
    'function isCurrencySupported(address) view returns (bool)',
    'function configureVault(address currency, uint8 mode, address vaultAddress)',
  ];

  const contract = new ethers.Contract(contractAddress, abi, wallet);

  try {
    // Check if contract exists
    console.log('1. Checking if contract is deployed...');
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      console.log('❌ Contract NOT deployed at this address!\n');
      return;
    }
    console.log('✅ Contract is deployed\n');

    // Get owner
    console.log('2. Checking contract owner...');
    try {
      const owner = await contract.owner();
      console.log(`✅ Owner: ${owner}`);
      console.log(`   Wallet is owner: ${owner.toLowerCase() === wallet.address.toLowerCase()}\n`);
    } catch (error) {
      console.log(`❌ Error getting owner: ${(error as any).message}\n`);
    }

    // Get supported currencies
    console.log('3. Checking supported currencies...');
    try {
      const currencies = await contract.getSupportedCurrencies();
      console.log(`   Found ${currencies.length} supported currencies:`);
      if (currencies.length === 0) {
        console.log('   ❌ NO CURRENCIES CONFIGURED!\n');
      } else {
        currencies.forEach((currency: string, index: number) => {
          console.log(`   ${index + 1}. ${currency}`);
        });
        console.log('');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${(error as any).message}\n`);
    }

    // Check specific currencies
    console.log('4. Checking if specific currencies are supported...');
    const tokens = {
      USDC: process.env.USDC_ADDRESS || '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      DAI: process.env.DAI_ADDRESS || '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      WETH: process.env.WETH_ADDRESS || '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    };

    for (const [name, address] of Object.entries(tokens)) {
      try {
        const isSupported = await contract.isCurrencySupported(address);
        console.log(`   ${name} (${address}): ${isSupported ? '✅ Supported' : '❌ Not supported'}`);
      } catch (error) {
        console.log(`   ${name}: ❌ Error checking`);
      }
    }
    console.log('');

    // Get goal counter
    console.log('5. Checking goal counter...');
    try {
      const counter = await contract.goalCounter();
      console.log(`   Total goals created: ${counter.toString()}\n`);
    } catch (error) {
      console.log(`   ❌ Error: ${(error as any).message}\n`);
    }

    console.log('========================================');
    console.log('ANALYSIS');
    console.log('========================================');
    console.log('If currencies are empty:');
    console.log('  → Need to call configureVault() for each currency/mode');
    console.log('  → Run: npm run configure-vaults');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the check
checkContractState()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
