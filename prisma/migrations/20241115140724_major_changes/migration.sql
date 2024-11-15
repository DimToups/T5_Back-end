-- CreateEnum
CREATE TYPE "difficulties" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "categories" AS ENUM ('GENERAL_KNOWLEDGE', 'SCIENCE', 'SPORTS', 'GEOGRAPHY', 'HISTORY', 'POLITICS', 'ART', 'MUSIC', 'FILMS', 'ANIMALS');

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
    "difficulty" "difficulties",
    "category" "categories",
    "public_code" TEXT,
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
    "difficulty" "difficulties" NOT NULL,
    "category" "categories" NOT NULL,
    "correct_answer" TEXT NOT NULL,
    "incorrect_answers" TEXT[],

    CONSTRAINT "questions_pkey" PRIMARY KEY ("sum")
);

-- CreateTable
CREATE TABLE "game_questions" (
    "game_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,

    CONSTRAINT "game_questions_pkey" PRIMARY KEY ("game_id","question_id")
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
ALTER TABLE "game_questions" ADD CONSTRAINT "game_questions_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_questions" ADD CONSTRAINT "game_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("sum") ON DELETE RESTRICT ON UPDATE CASCADE;
