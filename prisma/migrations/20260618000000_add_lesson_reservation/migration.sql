CREATE TABLE "LessonReservation" (
  "id" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "memo" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "LessonReservation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LessonReservation_memberId_idx" ON "LessonReservation"("memberId");
CREATE INDEX "LessonReservation_memberId_startsAt_idx" ON "LessonReservation"("memberId", "startsAt");
CREATE INDEX "LessonReservation_startsAt_idx" ON "LessonReservation"("startsAt");

ALTER TABLE "LessonReservation"
ADD CONSTRAINT "LessonReservation_memberId_fkey"
FOREIGN KEY ("memberId") REFERENCES "Member"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LessonReservation" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated active users manage own lesson reservations"
ON "LessonReservation"
FOR ALL
TO authenticated
USING (
  public.is_active_app_user()
  AND EXISTS (
    SELECT 1
    FROM "Member"
    WHERE "Member"."id" = "LessonReservation"."memberId"
      AND "Member"."ownerUserId" = (SELECT auth.uid())
  )
)
WITH CHECK (
  public.is_active_app_user()
  AND EXISTS (
    SELECT 1
    FROM "Member"
    WHERE "Member"."id" = "LessonReservation"."memberId"
      AND "Member"."ownerUserId" = (SELECT auth.uid())
  )
);
