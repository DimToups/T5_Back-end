-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_user_id_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz" DROP CONSTRAINT "quiz_user_id_fkey";

-- AddForeignKey
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
