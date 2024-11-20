/*
  Warnings:

  - Added the required column `position` to the `game_questions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "game_questions" ADD COLUMN     "position" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "questions" ALTER COLUMN "difficulty" DROP NOT NULL,
ALTER COLUMN "category" DROP NOT NULL;
