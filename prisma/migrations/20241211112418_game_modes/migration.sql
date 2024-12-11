/*
  Warnings:

  - The primary key for the `answers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `empty` on the `answers` table. All the data in the column will be lost.
  - You are about to drop the column `game_id` on the `answers` table. All the data in the column will be lost.
  - You are about to drop the column `correct_answer` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `incorrect_answers` on the `questions` table. All the data in the column will be lost.
  - Added the required column `answer_content` to the `answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `answer_type` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "answer_type" AS ENUM ('TEXT', 'IMAGE', 'SOUND');

-- CreateEnum
CREATE TYPE "game_modes" AS ENUM ('SINGLEPLAYER', 'TIME_EASY', 'TIME_MEDIUM', 'TIME_HARD', 'MULTIPLAYER', 'TEAM_EASY', 'TEAM_MEDIUM', 'TEAM_HARD');

-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_game_id_fkey";

-- AlterTable
ALTER TABLE "answers" DROP CONSTRAINT "answers_pkey",
DROP COLUMN "empty",
DROP COLUMN "game_id",
ADD COLUMN     "answer_content" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "type" "answer_type" NOT NULL,
ADD CONSTRAINT "answers_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "mode" "game_modes" NOT NULL DEFAULT 'SINGLEPLAYER';

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "correct_answer",
DROP COLUMN "incorrect_answers",
ADD COLUMN     "answer_type" "answer_type" NOT NULL;

-- CreateTable
CREATE TABLE "statistics_answers" (
    "game_id" TEXT NOT NULL,
    "question_sum" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "empty" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "statistics_answers_pkey" PRIMARY KEY ("game_id","question_sum")
);

-- CreateTable
CREATE TABLE "rooms" (
    "game_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("game_id")
);

-- CreateTable
CREATE TABLE "room_players" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "username" TEXT,
    "room_id" TEXT NOT NULL,
    "owner" BOOLEAN NOT NULL DEFAULT false,
    "team_id" TEXT,

    CONSTRAINT "room_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "statistics_answers" ADD CONSTRAINT "statistics_answers_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistics_answers" ADD CONSTRAINT "statistics_answers_question_sum_fkey" FOREIGN KEY ("question_sum") REFERENCES "questions"("sum") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_players" ADD CONSTRAINT "room_players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_players" ADD CONSTRAINT "room_players_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("game_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_players" ADD CONSTRAINT "room_players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("game_id") ON DELETE CASCADE ON UPDATE CASCADE;
