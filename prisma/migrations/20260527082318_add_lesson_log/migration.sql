-- CreateTable
CREATE TABLE "LessonLog" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "lessonNumber" INTEGER NOT NULL,
    "exercises" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "signatureData" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonLog_memberId_idx" ON "LessonLog"("memberId");

-- AddForeignKey
ALTER TABLE "LessonLog" ADD CONSTRAINT "LessonLog_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
