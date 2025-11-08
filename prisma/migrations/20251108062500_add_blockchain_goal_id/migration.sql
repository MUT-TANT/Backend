-- AlterTable
ALTER TABLE "Goal" ADD COLUMN "blockchainGoalId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Goal_blockchainGoalId_key" ON "Goal"("blockchainGoalId");

-- CreateIndex
CREATE INDEX "Goal_blockchainGoalId_idx" ON "Goal"("blockchainGoalId");
