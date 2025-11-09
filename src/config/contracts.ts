// Contract addresses and ABIs
export const CONTRACT_ADDRESSES = {
  STACKSAVE: process.env.STACKSAVE_CONTRACT || '0xa9EDF625508bE4AcE93d3013B0cC4A5c3BD69F1a',
  YIELD_ROUTER: process.env.YIELD_ROUTER_CONTRACT || '0x26eDe7de9AD22F05D283FAB6436E50016b60bDdF',
  USDC_VAULT: process.env.USDC_VAULT || '0x08677300cbdF89d2C0b55Ae124eB3e7ae70b21C1',
  DAI_VAULT: process.env.DAI_VAULT || '0x4D489e902D14B05E1cC00dd53334C18eD24c9a73',
  WETH_VAULT: process.env.WETH_VAULT || '0x340E9C7B5b7BedbE15cAC0E9A98e44CF324eb511',
  TOKEN_FAUCET: process.env.TOKEN_FAUCET || '0x81782AE5663A590A8758996a8c1a20956279f888',
};

export const TOKEN_ADDRESSES = {
  USDC: process.env.USDC_ADDRESS || '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  DAI: process.env.DAI_ADDRESS || '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  WETH: process.env.WETH_ADDRESS || '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
};

// Essential StackSaveOctant ABI
export const STACKSAVE_ABI = [
  'function createGoal(string name, address currency, uint8 mode, uint256 targetAmount, uint256 duration, uint256 donationPct) returns (uint256)',
  'function deposit(uint256 goalId, uint256 amount)',
  'function withdrawCompleted(uint256 goalId)',
  'function withdrawEarly(uint256 goalId)',
  'function getGoalDetails(uint256 goalId) view returns (tuple(uint256 id, address owner, address currency, uint8 mode, uint256 targetAmount, uint256 duration, uint256 donationPercentage, uint256 depositedAmount, uint256 createdAt, uint256 lastDepositTime, uint8 status) goal, uint256 currentValue, uint256 yieldEarned)',
  'function getUserGoals(address user) view returns (uint256[])',
  'function getSupportedCurrencies() view returns (address[])',
  'function getVaultAPY(address currency, uint8 mode) view returns (uint256)',
  'function setDonationPercentage(uint256 goalId, uint256 newPercentage)',
  'function goalCounter() view returns (uint256)',
  'event GoalCreated(uint256 indexed goalId, address indexed owner, address currency, uint8 mode, uint256 targetAmount, uint256 duration, uint256 donationPercentage)',
  'event Deposited(uint256 indexed goalId, address indexed user, uint256 amount, uint256 vaultShares)',
  'event WithdrawnCompleted(uint256 indexed goalId, address indexed user, uint256 principal, uint256 yield, uint256 userYield, uint256 donatedYield)',
  'event WithdrawnEarly(uint256 indexed goalId, address indexed user, uint256 amount, uint256 penalty, uint256 penaltyToRewards, uint256 penaltyToTreasury)',
  'event DonationPercentageUpdated(uint256 indexed goalId, uint256 oldPct, uint256 newPct)',
  'event VaultConfigured(address indexed currency, uint8 mode, address vaultAddress)',
];

// ERC20 ABI for token operations
export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

// TokenFaucet ABI
export const FAUCET_ABI = [
  'function claimTokens(address token)',
  'function canClaim(address user, address token) view returns (bool, uint256)',
  'function claimAmounts(address token) view returns (uint256)',
];
