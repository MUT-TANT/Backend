-- CreateTable
CREATE TABLE "Goal" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "mode" INTEGER NOT NULL DEFAULT 0,
    "targetAmount" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "donationPercentage" INTEGER NOT NULL DEFAULT 500,
    "depositedAmount" TEXT NOT NULL DEFAULT '0',
    "currentValue" TEXT NOT NULL DEFAULT '0',
    "yieldEarned" TEXT NOT NULL DEFAULT '0',
    "status" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastDepositTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Goal_owner_idx" ON "Goal"("owner");

-- CreateIndex
CREATE INDEX "Goal_status_idx" ON "Goal"("status");
