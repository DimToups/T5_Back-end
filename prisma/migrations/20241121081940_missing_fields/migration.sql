/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `games` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `quiz` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "games" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "current_question" SET DEFAULT 0,
ALTER COLUMN "score" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "quiz" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "games_code_key" ON "games"("code");
