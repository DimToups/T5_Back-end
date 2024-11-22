-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_question_sum_fkey";

-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_user_id_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_user_id_fkey";

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_sum_fkey" FOREIGN KEY ("question_sum") REFERENCES "questions"("sum") ON DELETE CASCADE ON UPDATE CASCADE;
