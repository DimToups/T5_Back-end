-- CreateEnum
CREATE TYPE "difficulties" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "categories" AS ENUM ('GENERAL_KNOWLEDGE', 'ENTERTAINMENT_BOOKS', 'ENTERTAINMENT_FILM', 'ENTERTAINMENT_MUSIC', 'ENTERTAINMENT_MUSICALS_AND_THEATRES', 'ENTERTAINMENT_TELEVISION', 'ENTERTAINMENT_VIDEO_GAMES', 'ENTERTAINMENT_BOARD_GAMES', 'SCIENCE_AND_NATURE', 'SCIENCE_COMPUTERS', 'SCIENCE_MATHEMATICS', 'MYTHOLOGY', 'SPORTS', 'GEOGRAPHY', 'HISTORY', 'POLITICS', 'ART', 'CELEBRITIES', 'ANIMALS', 'VEHICLES', 'ENTERTAINMENT_COMICS', 'SCIENCE_GADGETS', 'ENTERTAINMENT_JAPANESE_ANIME_AND_MANGA', 'ENTERTAINMENT_CARTOON_AND_ANIMATIONS');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expire_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" "difficulties",
    "category" "categories",
    "published" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT,

    CONSTRAINT "quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "current_question" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "sum" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "difficulty" "difficulties",
    "category" "categories",
    "correct_answer" TEXT NOT NULL,
    "incorrect_answers" TEXT[],
    "user_id" TEXT,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("sum")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "quiz_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("quiz_id","question_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("sum") ON DELETE CASCADE ON UPDATE CASCADE;
