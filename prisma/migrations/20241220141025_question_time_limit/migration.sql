-- CreateTable
CREATE TABLE "time_limits" (
    "game_id" TEXT NOT NULL,
    "question_sum" TEXT NOT NULL,
    "time_limit" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_limits_pkey" PRIMARY KEY ("game_id","question_sum")
);

-- AddForeignKey
ALTER TABLE "time_limits" ADD CONSTRAINT "time_limits_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_limits" ADD CONSTRAINT "time_limits_question_sum_fkey" FOREIGN KEY ("question_sum") REFERENCES "questions"("sum") ON DELETE CASCADE ON UPDATE CASCADE;
