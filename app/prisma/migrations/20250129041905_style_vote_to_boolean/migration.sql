/*
  Warnings:

  - You are about to alter the column `vote` on the `commentvote` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.
  - You are about to alter the column `vote` on the `stylevote` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.

*/
-- AlterTable
ALTER TABLE `CommentVote` MODIFY `vote` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `StyleVote` MODIFY `vote` BOOLEAN NOT NULL DEFAULT true;
