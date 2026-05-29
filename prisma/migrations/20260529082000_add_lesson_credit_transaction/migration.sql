-- CreateTable
CREATE TABLE "LessonCreditTransaction" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "lessonCount" INTEGER NOT NULL,
    "memo" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonCreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonCreditTransaction_memberId_idx" ON "LessonCreditTransaction"("memberId");

-- AddForeignKey
ALTER TABLE "LessonCreditTransaction" ADD CONSTRAINT "LessonCreditTransaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
