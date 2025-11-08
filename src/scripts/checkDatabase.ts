import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
  console.log('========================================');
  console.log('CHECKING DATABASE');
  console.log('========================================\n');

  const prisma = new PrismaClient();

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
    const ownerMap = new Map<string, number>();
    const addressFormatIssues: string[] = [];

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
    } else {
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

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
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
