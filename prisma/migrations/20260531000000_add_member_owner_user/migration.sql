ALTER TABLE "Member" ADD COLUMN "ownerUserId" UUID;

UPDATE "Member"
SET "ownerUserId" = (
  SELECT id
  FROM auth.users
  WHERE lower(email) = 'fabiankmroh@gmail.com'
  LIMIT 1
)
WHERE "ownerUserId" IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Member" WHERE "ownerUserId" IS NULL) THEN
    RAISE EXCEPTION 'Create Supabase Auth user fabiankmroh@gmail.com before running this migration.';
  END IF;
END $$;

ALTER TABLE "Member" ALTER COLUMN "ownerUserId" SET NOT NULL;

CREATE INDEX "Member_ownerUserId_idx" ON "Member"("ownerUserId");
CREATE INDEX "Member_ownerUserId_updatedAt_idx" ON "Member"("ownerUserId", "updatedAt");

ALTER TABLE "Member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LessonLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LessonCreditTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LessonExercise" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users manage own members"
ON "Member"
FOR ALL
TO authenticated
USING ((SELECT auth.uid()) = "ownerUserId")
WITH CHECK ((SELECT auth.uid()) = "ownerUserId");

CREATE POLICY "Authenticated users manage own lesson logs"
ON "LessonLog"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "Member"
    WHERE "Member"."id" = "LessonLog"."memberId"
      AND "Member"."ownerUserId" = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "Member"
    WHERE "Member"."id" = "LessonLog"."memberId"
      AND "Member"."ownerUserId" = (SELECT auth.uid())
  )
);

CREATE POLICY "Authenticated users manage own lesson credits"
ON "LessonCreditTransaction"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "Member"
    WHERE "Member"."id" = "LessonCreditTransaction"."memberId"
      AND "Member"."ownerUserId" = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "Member"
    WHERE "Member"."id" = "LessonCreditTransaction"."memberId"
      AND "Member"."ownerUserId" = (SELECT auth.uid())
  )
);

CREATE POLICY "Authenticated users manage own lesson exercises"
ON "LessonExercise"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "LessonLog"
    INNER JOIN "Member" ON "Member"."id" = "LessonLog"."memberId"
    WHERE "LessonLog"."id" = "LessonExercise"."lessonLogId"
      AND "Member"."ownerUserId" = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "LessonLog"
    INNER JOIN "Member" ON "Member"."id" = "LessonLog"."memberId"
    WHERE "LessonLog"."id" = "LessonExercise"."lessonLogId"
      AND "Member"."ownerUserId" = (SELECT auth.uid())
  )
);
