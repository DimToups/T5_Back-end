-- CreateTable
CREATE TABLE "answers" (
    "game_id" TEXT NOT NULL,
    "question_sum" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "empty" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("game_id","question_sum")
);

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_sum_fkey" FOREIGN KEY ("question_sum") REFERENCES "questions"("sum") ON DELETE RESTRICT ON UPDATE CASCADE;
