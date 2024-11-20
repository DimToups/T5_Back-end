/*
  Warnings:

  - The values [SCIENCE,MUSIC,FILMS] on the enum `categories` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "categories_new" AS ENUM ('GENERAL_KNOWLEDGE', 'ENTERTAINMENT_BOOKS', 'ENTERTAINMENT_FILM', 'ENTERTAINMENT_MUSIC', 'ENTERTAINMENT_MUSICALS_AND_THEATRES', 'ENTERTAINMENT_TELEVISION', 'ENTERTAINMENT_VIDEO_GAMES', 'ENTERTAINMENT_BOARD_GAMES', 'SCIENCE_AND_NATURE', 'SCIENCE_COMPUTERS', 'SCIENCE_MATHEMATICS', 'MYTHOLOGY', 'SPORTS', 'GEOGRAPHY', 'HISTORY', 'POLITICS', 'ART', 'CELEBRITIES', 'ANIMALS', 'VEHICLES', 'ENTERTAINMENT_COMICS', 'SCIENCE_GADGETS', 'ENTERTAINMENT_JAPANESE_ANIME_AND_MANGA', 'ENTERTAINMENT_CARTOON_AND_ANIMATIONS');
ALTER TABLE "quiz" ALTER COLUMN "category" TYPE "categories_new" USING ("category"::text::"categories_new");
ALTER TABLE "questions" ALTER COLUMN "category" TYPE "categories_new" USING ("category"::text::"categories_new");
ALTER TYPE "categories" RENAME TO "categories_old";
ALTER TYPE "categories_new" RENAME TO "categories";
DROP TYPE "categories_old";
COMMIT;
