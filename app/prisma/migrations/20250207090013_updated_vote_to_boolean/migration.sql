/*
  Warnings:

  - You are about to alter the column `vote` on the `CollectionVote` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.
  - You are about to alter the column `vote` on the `CommentVote` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.
  - You are about to alter the column `vote` on the `ItemVote` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.
  - You are about to alter the column `vote` on the `StyleVote` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.

*/
-- AlterTable
ALTER TABLE `CollectionVote` MODIFY `vote` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `CommentVote` MODIFY `vote` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `ItemVote` MODIFY `vote` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `StyleVote` MODIFY `vote` BOOLEAN NOT NULL DEFAULT true;
