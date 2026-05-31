CREATE TYPE "UserRole" AS ENUM ('MASTER', 'TRAINER');

CREATE TABLE "AppUser" (
  "id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL DEFAULT '',
  "role" "UserRole" NOT NULL DEFAULT 'TRAINER',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");

INSERT INTO "AppUser" ("id", "email", "name", "role", "isActive")
SELECT
  "id",
  lower("email"),
  COALESCE("raw_user_meta_data" ->> 'name', ''),
  CASE
    WHEN lower("email") = 'fabiankmroh@gmail.com' THEN 'MASTER'::"UserRole"
    ELSE 'TRAINER'::"UserRole"
  END,
  true
FROM auth.users
WHERE "email" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "AppUser"
    WHERE lower("email") = 'fabiankmroh@gmail.com'
      AND "role" = 'MASTER'
  ) THEN
    RAISE EXCEPTION 'Create Supabase Auth user fabiankmroh@gmail.com before running this migration.';
  END IF;
END $$;

ALTER TABLE "Member"
ADD CONSTRAINT "Member_ownerUserId_fkey"
FOREIGN KEY ("ownerUserId") REFERENCES "AppUser"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION public.is_active_app_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM "AppUser"
    WHERE "id" = (SELECT auth.uid())
      AND "isActive" = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_master_app_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM "AppUser"
    WHERE "id" = (SELECT auth.uid())
      AND "role" = 'MASTER'
      AND "isActive" = true
  );
$$;

ALTER TABLE "AppUser" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own app user and masters read all"
ON "AppUser"
FOR SELECT
TO authenticated
USING ("id" = (SELECT auth.uid()) OR public.is_master_app_user());

CREATE POLICY "Masters manage app users"
ON "AppUser"
FOR ALL
TO authenticated
USING (public.is_master_app_user())
WITH CHECK (public.is_master_app_user());

DROP POLICY IF EXISTS "Authenticated users manage own members" ON "Member";
DROP POLICY IF EXISTS "Authenticated users manage own lesson logs" ON "LessonLog";
DROP POLICY IF EXISTS "Authenticated users manage own lesson credits" ON "LessonCreditTransaction";
DROP POLICY IF EXISTS "Authenticated users manage own lesson exercises" ON "LessonExercise";

CREATE POLICY "Authenticated active users manage own members"
ON "Member"
FOR ALL
TO authenticated
USING (public.is_active_app_user() AND (SELECT auth.uid()) = "ownerUserId")
WITH CHECK (public.is_active_app_user() AND (SELECT auth.uid()) = "ownerUserId");

CREATE POLICY "Authenticated active users manage own lesson logs"
ON "LessonLog"
FOR ALL
TO authenticated
USING (
  public.is_active_app_user()
  AND EXISTS (
    SELECT 1
    FROM "Member"
    WHERE "Member"."id" = "LessonLog"."memberId"
      AND "Member"."ownerUserId" = (SELECT auth.uid())
  )
)
WITH CHECK (
  public.is_active_app_user()
  AND EXISTS (
    SELECT 1
    FROM "Member"
    WHERE "Member"."id" = "LessonLog"."memberId"
      AND "Member"."ownerUserId" = (SELECT auth.uid())
  )
);

CREATE POLICY "Authenticated active users manage own lesson credits"
ON "LessonCreditTransaction"
FOR ALL
TO authenticated
USING (
  public.is_active_app_user()
  AND EXISTS (
    SELECT 1
    FROM "Member"
    WHERE "Member"."id" = "LessonCreditTransaction"."memberId"
      AND "Member"."ownerUserId" = (SELECT auth.uid())
  )
)
WITH CHECK (
  public.is_active_app_user()
  AND EXISTS (
    SELECT 1
    FROM "Member"
    WHERE "Member"."id" = "LessonCreditTransaction"."memberId"
      AND "Member"."ownerUserId" = (SELECT auth.uid())
  )
);

CREATE POLICY "Authenticated active users manage own lesson exercises"
ON "LessonExercise"
FOR ALL
TO authenticated
USING (
  public.is_active_app_user()
  AND EXISTS (
    SELECT 1
    FROM "LessonLog"
    INNER JOIN "Member" ON "Member"."id" = "LessonLog"."memberId"
    WHERE "LessonLog"."id" = "LessonExercise"."lessonLogId"
      AND "Member"."ownerUserId" = (SELECT auth.uid())
  )
)
WITH CHECK (
  public.is_active_app_user()
  AND EXISTS (
    SELECT 1
    FROM "LessonLog"
    INNER JOIN "Member" ON "Member"."id" = "LessonLog"."memberId"
    WHERE "LessonLog"."id" = "LessonExercise"."lessonLogId"
      AND "Member"."ownerUserId" = (SELECT auth.uid())
  )
);
