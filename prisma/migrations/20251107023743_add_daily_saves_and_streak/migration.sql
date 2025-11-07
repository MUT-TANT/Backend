-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastStreakUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "DailySave" (
    "id" SERIAL NOT NULL,
    "goalId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "amount" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailySave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailySave_goalId_idx" ON "DailySave"("goalId");

-- CreateIndex
CREATE INDEX "DailySave_date_idx" ON "DailySave"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailySave_goalId_date_key" ON "DailySave"("goalId", "date");

-- AddForeignKey
ALTER TABLE "DailySave" ADD CONSTRAINT "DailySave_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
