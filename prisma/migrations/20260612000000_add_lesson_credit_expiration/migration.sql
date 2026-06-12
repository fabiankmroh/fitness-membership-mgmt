ALTER TABLE "LessonCreditTransaction" ADD COLUMN "expiresAt" TIMESTAMP(3);

CREATE INDEX "LessonCreditTransaction_memberId_expiresAt_idx" ON "LessonCreditTransaction"("memberId", "expiresAt");
