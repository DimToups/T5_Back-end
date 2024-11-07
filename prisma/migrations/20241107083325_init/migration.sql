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
    "quiz_code" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("quiz_code","question_id")
);

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_code_fkey" FOREIGN KEY ("quiz_code") REFERENCES "quiz"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
