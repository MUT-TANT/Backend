import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

async function configureVaults() {
  console.log('========================================');
  console.log('CONFIGURING CONTRACT VAULTS');
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

  // Vault addresses from env
  const vaults = {
    USDC_VAULT: process.env.USDC_VAULT || '0x08677300cbdF89d2C0b55Ae124eB3e7ae70b21C1',
    DAI_VAULT: process.env.DAI_VAULT || '0x4D489e902D14B05E1cC00dd53334C18eD24c9a73',
    WETH_VAULT: process.env.WETH_VAULT || '0x340E9C7B5b7BedbE15cAC0E9A98e44CF324eb511',
  };

  // Token addresses from env
  const tokens = {
    USDC: process.env.USDC_ADDRESS || '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    DAI: process.env.DAI_ADDRESS || '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WETH: process.env.WETH_ADDRESS || '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  };

  console.log('Configuration:');
  console.log(`  USDC: ${tokens.USDC} → Vault: ${vaults.USDC_VAULT}`);
  console.log(`  DAI: ${tokens.DAI} → Vault: ${vaults.DAI_VAULT}`);
  console.log(`  WETH: ${tokens.WETH} → Vault: ${vaults.WETH_VAULT}\n`);

  // Contract ABI
  const abi = [
    'function configureVault(address currency, uint8 mode, address vaultAddress)',
    'function owner() view returns (address)',
    'function getSupportedCurrencies() view returns (address[])',
  ];

  const contract = new ethers.Contract(contractAddress, abi, wallet);

  try {
    // Check owner
    console.log('1. Verifying ownership...');
    const owner = await contract.owner();
    console.log(`   Owner: ${owner}`);
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.log(`   ❌ ERROR: Wallet is not owner! Cannot configure vaults.\n`);
      return;
    }
    console.log(`   ✅ Wallet is owner\n`);

    // Configure vaults
    // Mode: 0 = Lite, 1 = Pro
    const configurations = [
      { currency: tokens.USDC, mode: 0, vault: vaults.USDC_VAULT, name: 'USDC (Lite)' },
      { currency: tokens.DAI, mode: 0, vault: vaults.DAI_VAULT, name: 'DAI (Lite)' },
      { currency: tokens.WETH, mode: 1, vault: vaults.WETH_VAULT, name: 'WETH (Pro)' },
    ];

    console.log('2. Configuring vaults...\n');

    for (const config of configurations) {
      try {
        console.log(`   Configuring ${config.name}...`);
        console.log(`     Currency: ${config.currency}`);
        console.log(`     Mode: ${config.mode === 0 ? 'Lite' : 'Pro'}`);
        console.log(`     Vault: ${config.vault}`);

        const tx = await contract.configureVault(config.currency, config.mode, config.vault);
        console.log(`     Tx: ${tx.hash}`);

        console.log(`     Waiting for confirmation...`);
        const receipt = await tx.wait();

        console.log(`     ✅ Configured (Gas used: ${receipt.gasUsed.toString()})\n`);
      } catch (error: any) {
        console.log(`     ❌ Error: ${error.message}\n`);
      }
    }

    // Verify configuration
    console.log('3. Verifying configuration...');
    const supportedCurrencies = await contract.getSupportedCurrencies();
    console.log(`   Supported currencies: ${supportedCurrencies.length}`);
    supportedCurrencies.forEach((currency: string, index: number) => {
      const tokenName = Object.keys(tokens).find(
        (key) => tokens[key as keyof typeof tokens].toLowerCase() === currency.toLowerCase()
      );
      console.log(`     ${index + 1}. ${currency} ${tokenName ? `(${tokenName})` : ''}`);
    });

    console.log('\n========================================');
    console.log('✅ VAULTS CONFIGURED SUCCESSFULLY');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  }
}

// Run the configuration
configureVaults()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
