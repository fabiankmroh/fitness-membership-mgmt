import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const getCachedExerciseCatalog = unstable_cache(
  async () => {
    return prisma.exerciseCategory.findMany({
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
  },
  ["exercise-catalog"],
  {
    revalidate: 3600
  }
);

export async function getExerciseCatalogForForm() {
  const categories = await getCachedExerciseCatalog();

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    exercises: category.exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name
    }))
  }));
}
