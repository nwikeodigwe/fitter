/*
  Warnings:

  - You are about to alter the column `vote` on the `itemvote` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.

*/
-- AlterTable
ALTER TABLE `ItemVote` MODIFY `vote` BOOLEAN NOT NULL DEFAULT true;
