/*
  Warnings:

  - You are about to drop the `rooms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "rooms";

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "category" INTEGER NOT NULL,
    "correct_answer" TEXT NOT NULL,
    "incorrect_answers" TEXT[],

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz" (
    "code" TEXT NOT NULL,
    "difficulty" INTEGER,
    "category" INTEGER,

    CONSTRAINT "quiz_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "quizCode" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("quizCode","questionId")
);

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quizCode_fkey" FOREIGN KEY ("quizCode") REFERENCES "quiz"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
