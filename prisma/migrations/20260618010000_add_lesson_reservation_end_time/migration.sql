ALTER TABLE "LessonReservation"
ADD COLUMN "endsAt" TIMESTAMP(3);

UPDATE "LessonReservation"
SET "endsAt" = "startsAt" + INTERVAL '1 hour'
WHERE "endsAt" IS NULL;

ALTER TABLE "LessonReservation"
ALTER COLUMN "endsAt" SET NOT NULL;

CREATE INDEX "LessonReservation_endsAt_idx" ON "LessonReservation"("endsAt");
