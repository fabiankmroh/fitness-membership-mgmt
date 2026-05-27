import { prisma } from "@/lib/prisma";

export const DEFAULT_EXERCISE_CATALOG = [
  {
    name: "가슴",
    exercises: [
      "바벨 벤치 프레스",
      "덤벨 벤치 프레스",
      "인클라인 벤치 프레스",
      "덤벨 플라이",
      "펙 덱 플라이 (테크노짐)",
      "TRX 푸시업",
      "케이블 크로스오버"
    ]
  },
  {
    name: "등",
    exercises: [
      "데드리프트",
      "풀업 (턱걸이)",
      "랫 풀다운",
      "바벨 로우",
      "덤벨 로우",
      "시티드 케이블 로우"
    ]
  },
  {
    name: "하체",
    exercises: [
      "바벨 스쿼트",
      "레그 프레스",
      "런지",
      "레그 익스텐션",
      "레그 컬",
      "스티프 레그 데드리프트",
      "불가리안 스플릿 스쿼트",
      "카프 레이즈"
    ]
  },
  {
    name: "어깨",
    exercises: [
      "오버헤드 프레스 (밀리터리 프레스)",
      "덤벨 숄더 프레스",
      "사이드 레터럴 레이즈",
      "프론트 레이즈",
      "벤트오버 레터럴 레이즈",
      "페이스 풀",
      "아놀드 프레스",
      "업라이트 로우"
    ]
  },
  {
    name: "팔",
    exercises: [
      "바벨 컬",
      "덤벨 컬",
      "해머 컬",
      "트라이셉스 푸시다운",
      "라잉 트라이셉스 익스텐션",
      "오버헤드 트라이셉스 익스텐션",
      "덤벨 킥백"
    ]
  },
  {
    name: "코어/복부",
    exercises: [
      "크런치",
      "레그 레이즈",
      "플랭크",
      "싯업",
      "에이비(AB) 롤아웃"
    ]
  }
];

export async function ensureExerciseCatalog() {
  for (const [categoryIndex, category] of DEFAULT_EXERCISE_CATALOG.entries()) {
    const savedCategory = await prisma.exerciseCategory.upsert({
      where: {
        name: category.name
      },
      update: {
        isActive: true,
        sortOrder: categoryIndex
      },
      create: {
        name: category.name,
        sortOrder: categoryIndex
      }
    });

    for (const [exerciseIndex, exerciseName] of category.exercises.entries()) {
      await prisma.exerciseCatalog.upsert({
        where: {
          categoryId_name: {
            categoryId: savedCategory.id,
            name: exerciseName
          }
        },
        update: {
          isActive: true,
          sortOrder: exerciseIndex
        },
        create: {
          categoryId: savedCategory.id,
          name: exerciseName,
          sortOrder: exerciseIndex
        }
      });
    }
  }
}

export async function getExerciseCatalogForForm() {
  await ensureExerciseCatalog();

  const categories = await prisma.exerciseCategory.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      sortOrder: "asc"
    },
    include: {
      exercises: {
        where: {
          isActive: true
        },
        orderBy: {
          sortOrder: "asc"
        }
      }
    }
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    exercises: category.exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name
    }))
  }));
}
