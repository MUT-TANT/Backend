# StackSave Backend API

Backend REST API for StackSave - A DeFi savings platform integrating with Ethereum smart contracts.

## Features

- Complete REST API for goal management (create, deposit, withdraw)
- Smart contract integration using ethers.js v6
- Token faucet support for test tokens
- User goal tracking
- APY information for supported currencies
- TypeScript for type safety
- CORS enabled for Flutter mobile app integration

## Tech Stack

- **Node.js** with Express.js
- **TypeScript** for type safety
- **Ethers.js v6** for blockchain interaction
- **Tenderly Fork** (Mainnet fork for testing)

## Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:

Edit `Backend/.env` and set your private key:
```bash
PRIVATE_KEY=your_private_key_here
```

All other variables (contract addresses, RPC URL) are already configured for the deployed Tenderly fork.

### Running the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /health` - Check server status

### Goals Management

#### Create Goal
```http
POST /api/goals
Content-Type: application/json

{
  "name": "Vacation Fund",
  "currency": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "mode": 0,
  "targetAmount": "1000",
  "durationInDays": 90,
  "donationPercentage": 500
}
```

**Parameters:**
- `name` - Goal name
- `currency` - Token address (USDC, DAI, or WETH)
- `mode` - 0 for Lite (Aave), 1 for Pro (Morpho)
- `targetAmount` - Target amount in token units
- `durationInDays` - Duration in days
- `donationPercentage` - Donation % in basis points (500 = 5%)

**Response:**
```json
{
  "success": true,
  "data": {
    "txHash": "0x...",
    "goalId": 1,
    "explorer": "https://dashboard.tenderly.co/tx/0x..."
  }
}
```

#### Get Goal Details
```http
GET /api/goals/:goalId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "goal": {
      "id": 1,
      "owner": "0x...",
      "currency": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "mode": 0,
      "targetAmount": "1000000000",
      "duration": 7776000,
      "donationPercentage": 500,
      "depositedAmount": "500000000",
      "createdAt": 1704067200,
      "lastDepositTime": 1704067200,
      "status": 0,
      "statusText": "Active"
    },
    "currentValue": "502000000",
    "yieldEarned": "2000000"
  }
}
```

#### Get User Goals
```http
GET /api/users/:address/goals
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "goals": [...],
    "total": 3
  }
}
```

#### Deposit to Goal
```http
POST /api/goals/:goalId/deposit
Content-Type: application/json

{
  "amount": "100"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "txHash": "0x...",
    "goalId": 1,
    "amount": "100",
    "explorer": "https://dashboard.tenderly.co/tx/0x..."
  }
}
```

#### Withdraw from Completed Goal
```http
POST /api/goals/:goalId/withdraw
```

**Response:**
```json
{
  "success": true,
  "data": {
    "txHash": "0x...",
    "goalId": 1,
    "explorer": "https://dashboard.tenderly.co/tx/0x..."
  }
}
```

#### Early Withdrawal
```http
POST /api/goals/:goalId/withdraw-early
```

**Note:** 2% penalty applied on early withdrawals

**Response:**
```json
{
  "success": true,
  "data": {
    "txHash": "0x...",
    "goalId": 1,
    "penalty": "2%",
    "explorer": "https://dashboard.tenderly.co/tx/0x..."
  }
}
```

#### Get Supported Currencies
```http
GET /api/goals/currencies/list
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currencies": [
      {
        "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "liteAPY": "3.50",
        "proAPY": "5.20"
      },
      ...
    ]
  }
}
```

### Faucet (Test Tokens)

#### Claim Tokens
```http
POST /api/faucet/claim
Content-Type: application/json

{
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "txHash": "0x...",
    "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "explorer": "https://dashboard.tenderly.co/tx/0x..."
  }
}
```

#### Check Claim Eligibility
```http
GET /api/faucet/can-claim/:address/:tokenAddress
```

**Response:**
```json
{
  "success": true,
  "data": {
    "canClaim": true,
    "nextClaimTime": 0,
    "nextClaimDate": null
  }
}
```

#### Get Token Balance
```http
GET /api/faucet/balance/:address/:tokenAddress
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "balance": "1000.0"
  }
}
```

## Token Addresses

All on Ethereum Mainnet (via Tenderly Fork):

- **USDC**: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- **DAI**: `0x6B175474E89094C44Da98b954EedeAC495271d0F`
- **WETH**: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`

## Contract Addresses

Deployed on Tenderly Mainnet Fork:

- **StackSave**: `0xa9EDF625508bE4AcE93d3013B0cC4A5c3BD69F1a`
- **Yield Router**: `0x26eDe7de9AD22F05D283FAB6436E50016b60bDdF`
- **Token Faucet**: `0x81782AE5663A590A8758996a8c1a20956279f888`
- **USDC Vault**: `0x08677300cbdF89d2C0b55Ae124eB3e7ae70b21C1`
- **DAI Vault**: `0x4D489e902D14B05E1cC00dd53334C18eD24c9a73`
- **WETH Vault**: `0x340E9C7B5b7BedbE15cAC0E9A98e44CF324eb511`

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (new goal)
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Integration with Flutter

### Example: Create a Goal

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> createGoal() async {
  final response = await http.post(
    Uri.parse('http://localhost:3000/api/goals'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'name': 'Vacation Fund',
      'currency': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      'mode': 0,
      'targetAmount': '1000',
      'durationInDays': 90,
      'donationPercentage': 500,
    }),
  );

  if (response.statusCode == 201) {
    final data = jsonDecode(response.body);
    print('Goal created: ${data['data']['goalId']}');
    print('Tx: ${data['data']['explorer']}');
  }
}
```

### Example: Get User Goals

```dart
Future<List<dynamic>> getUserGoals(String address) async {
  final response = await http.get(
    Uri.parse('http://localhost:3000/api/users/$address/goals'),
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return data['data']['goals'];
  }
  return [];
}
```

## Project Structure

```
Backend/
├── src/
│   ├── config/
│   │   └── contracts.ts       # Contract addresses and ABIs
│   ├── services/
│   │   ├── blockchain.service.ts  # Ethers.js provider/wallet
│   │   └── contract.service.ts    # Smart contract wrappers
│   ├── controllers/
│   │   ├── goals.controller.ts    # Goal endpoints
│   │   └── faucet.controller.ts   # Faucet endpoints
│   ├── routes/
│   │   ├── goals.routes.ts        # Goal routes
│   │   ├── users.routes.ts        # User routes
│   │   └── faucet.routes.ts       # Faucet routes
│   ├── middleware/
│   │   └── errorHandler.ts        # Error handling
│   └── server.ts                   # Main Express app
├── dist/                           # Compiled JavaScript
├── .env                           # Environment variables
├── tsconfig.json                  # TypeScript config
└── package.json
```

## Development Notes

- The backend uses the deployer wallet's private key for transactions
- All transactions are sent to Tenderly mainnet fork (Chain ID 8)
- Token approvals are handled automatically in deposit operations
- Goal IDs are parsed from GoalCreated events
- APY values are converted from basis points to percentages

## For Hackathon Judges

This backend provides a complete REST API for the StackSave DeFi savings platform. It abstracts all blockchain complexity, making it easy for the Flutter mobile app to interact with smart contracts through simple HTTP requests.

Key features:
- Full smart contract integration with automatic token approvals
- Test token faucet for easy testing
- Comprehensive error handling and validation
- Explorer links in all transaction responses for transparency
- Type-safe TypeScript implementation

The API is production-ready and deployed on the Tenderly mainnet fork for realistic testing with real DeFi protocols (Aave, Morpho Blue).
