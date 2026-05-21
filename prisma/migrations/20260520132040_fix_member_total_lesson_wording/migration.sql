/*
  Warnings:

  - You are about to drop the column `totallessons` on the `Member` table. All the data in the column will be lost.
  - Added the required column `totalLessons` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Member" DROP COLUMN "totallessons",
ADD COLUMN     "totalLessons" INTEGER NOT NULL;
