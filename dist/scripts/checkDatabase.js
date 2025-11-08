"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function checkDatabase() {
    console.log('========================================');
    console.log('CHECKING DATABASE');
    console.log('========================================\n');
    const prisma = new client_1.PrismaClient();
    try {
        // Get all goals
        const goals = await prisma.goal.findMany({
            select: {
                id: true,
                name: true,
                owner: true,
                status: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        console.log(`Total goals in database: ${goals.length}\n`);
        if (goals.length === 0) {
            console.log('No goals found in database.\n');
            return;
        }
        // Group by owner
        const ownerMap = new Map();
        const addressFormatIssues = [];
        goals.forEach((goal) => {
            const owner = goal.owner;
            const count = ownerMap.get(owner) || 0;
            ownerMap.set(owner, count + 1);
            // Check if address is properly formatted (lowercase)
            if (owner !== owner.toLowerCase()) {
                addressFormatIssues.push(owner);
            }
        });
        console.log('Goals by owner:');
        ownerMap.forEach((count, owner) => {
            console.log(`  ${owner}: ${count} goal(s)`);
        });
        console.log('');
        if (addressFormatIssues.length > 0) {
            console.log('⚠️  ADDRESS FORMAT ISSUES FOUND:');
            console.log(`Found ${addressFormatIssues.length} addresses with mixed case:`);
            addressFormatIssues.forEach((addr) => {
                console.log(`  ${addr} → should be ${addr.toLowerCase()}`);
            });
            console.log('');
            console.log('Recommendation: Update these addresses to lowercase for consistent querying.\n');
        }
        else {
            console.log('✅ All addresses are properly formatted (lowercase)\n');
        }
        // Show recent goals
        console.log('Recent goals (last 5):');
        goals.slice(0, 5).forEach((goal) => {
            console.log(`  ID: ${goal.id}`);
            console.log(`  Name: ${goal.name}`);
            console.log(`  Owner: ${goal.owner}`);
            console.log(`  Status: ${['Active', 'Completed', 'Abandoned', 'Withdrawn'][goal.status]}`);
            console.log(`  Created: ${goal.createdAt.toISOString()}`);
            console.log('');
        });
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
    console.log('========================================\n');
}
// Run the check
checkDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=checkDatabase.js.map