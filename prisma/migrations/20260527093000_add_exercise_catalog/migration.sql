-- CreateTable
CREATE TABLE "ExerciseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseCatalog" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonExercise" (
    "id" TEXT NOT NULL,
    "lessonLogId" TEXT NOT NULL,
    "exerciseCatalogId" TEXT,
    "customCategoryId" TEXT,
    "customName" TEXT NOT NULL DEFAULT '',
    "sets" INTEGER,
    "reps" INTEGER,
    "weightKg" DECIMAL(6,2),
    "memo" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonExercise_pkey" PRIMARY KEY ("id")
);

-- MigrateData
INSERT INTO "LessonExercise" (
    "id",
    "lessonLogId",
    "customName",
    "sortOrder",
    "createdAt",
    "updatedAt"
)
SELECT
    concat('legacy_', "id"),
    "id",
    "exercises",
    0,
    "createdAt",
    "updatedAt"
FROM "LessonLog"
WHERE "exercises" IS NOT NULL AND length(trim("exercises")) > 0;

-- AlterTable
ALTER TABLE "LessonLog" DROP COLUMN "exercises";

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseCategory_name_key" ON "ExerciseCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseCatalog_categoryId_name_key" ON "ExerciseCatalog"("categoryId", "name");

-- CreateIndex
CREATE INDEX "ExerciseCatalog_categoryId_idx" ON "ExerciseCatalog"("categoryId");

-- CreateIndex
CREATE INDEX "LessonExercise_lessonLogId_idx" ON "LessonExercise"("lessonLogId");

-- CreateIndex
CREATE INDEX "LessonExercise_exerciseCatalogId_idx" ON "LessonExercise"("exerciseCatalogId");

-- CreateIndex
CREATE INDEX "LessonExercise_customCategoryId_idx" ON "LessonExercise"("customCategoryId");

-- AddForeignKey
ALTER TABLE "ExerciseCatalog" ADD CONSTRAINT "ExerciseCatalog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExerciseCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonExercise" ADD CONSTRAINT "LessonExercise_lessonLogId_fkey" FOREIGN KEY ("lessonLogId") REFERENCES "LessonLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonExercise" ADD CONSTRAINT "LessonExercise_exerciseCatalogId_fkey" FOREIGN KEY ("exerciseCatalogId") REFERENCES "ExerciseCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonExercise" ADD CONSTRAINT "LessonExercise_customCategoryId_fkey" FOREIGN KEY ("customCategoryId") REFERENCES "ExerciseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SeedDefaultExerciseCategories
INSERT INTO "ExerciseCategory" ("id", "name", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES
    ('cat_chest', '가슴', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat_back', '등', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat_legs', '하체', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat_shoulders', '어깨', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat_arms', '팔', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat_core', '코어/복부', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- SeedDefaultExerciseCatalog
INSERT INTO "ExerciseCatalog" ("id", "categoryId", "name", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES
    ('ex_chest_barbell_bench_press', 'cat_chest', '바벨 벤치 프레스', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_chest_dumbbell_bench_press', 'cat_chest', '덤벨 벤치 프레스', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_chest_incline_bench_press', 'cat_chest', '인클라인 벤치 프레스', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_chest_dumbbell_fly', 'cat_chest', '덤벨 플라이', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_chest_pec_deck_fly', 'cat_chest', '펙 덱 플라이 (테크노짐)', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_chest_trx_pushup', 'cat_chest', 'TRX 푸시업', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_chest_cable_crossover', 'cat_chest', '케이블 크로스오버', 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_back_deadlift', 'cat_back', '데드리프트', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_back_pullup', 'cat_back', '풀업 (턱걸이)', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_back_lat_pulldown', 'cat_back', '랫 풀다운', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_back_barbell_row', 'cat_back', '바벨 로우', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_back_dumbbell_row', 'cat_back', '덤벨 로우', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_back_seated_cable_row', 'cat_back', '시티드 케이블 로우', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_legs_barbell_squat', 'cat_legs', '바벨 스쿼트', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_legs_leg_press', 'cat_legs', '레그 프레스', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_legs_lunge', 'cat_legs', '런지', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_legs_leg_extension', 'cat_legs', '레그 익스텐션', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_legs_leg_curl', 'cat_legs', '레그 컬', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_legs_stiff_leg_deadlift', 'cat_legs', '스티프 레그 데드리프트', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_legs_bulgarian_split_squat', 'cat_legs', '불가리안 스플릿 스쿼트', 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_legs_calf_raise', 'cat_legs', '카프 레이즈', 7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_shoulders_overhead_press', 'cat_shoulders', '오버헤드 프레스 (밀리터리 프레스)', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_shoulders_dumbbell_press', 'cat_shoulders', '덤벨 숄더 프레스', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_shoulders_lateral_raise', 'cat_shoulders', '사이드 레터럴 레이즈', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_shoulders_front_raise', 'cat_shoulders', '프론트 레이즈', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_shoulders_bentover_lateral_raise', 'cat_shoulders', '벤트오버 레터럴 레이즈', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_shoulders_face_pull', 'cat_shoulders', '페이스 풀', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_shoulders_arnold_press', 'cat_shoulders', '아놀드 프레스', 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_shoulders_upright_row', 'cat_shoulders', '업라이트 로우', 7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_arms_barbell_curl', 'cat_arms', '바벨 컬', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_arms_dumbbell_curl', 'cat_arms', '덤벨 컬', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_arms_hammer_curl', 'cat_arms', '해머 컬', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_arms_triceps_pushdown', 'cat_arms', '트라이셉스 푸시다운', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_arms_lying_triceps_extension', 'cat_arms', '라잉 트라이셉스 익스텐션', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_arms_overhead_triceps_extension', 'cat_arms', '오버헤드 트라이셉스 익스텐션', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_arms_dumbbell_kickback', 'cat_arms', '덤벨 킥백', 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_core_crunch', 'cat_core', '크런치', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_core_leg_raise', 'cat_core', '레그 레이즈', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_core_plank', 'cat_core', '플랭크', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_core_situp', 'cat_core', '싯업', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ex_core_ab_rollout', 'cat_core', '에이비(AB) 롤아웃', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
