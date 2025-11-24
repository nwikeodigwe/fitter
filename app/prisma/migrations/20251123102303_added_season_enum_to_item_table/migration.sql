/*
  Warnings:

  - You are about to drop the column `entity` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `entityId` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `model` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Comment` DROP COLUMN `entity`,
    DROP COLUMN `entityId`,
    ADD COLUMN `model` ENUM('STYLE', 'ITEM', 'COMMENT', 'BRAND', 'COLLECTION') NOT NULL,
    ADD COLUMN `modelId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Item` ADD COLUMN `season` ENUM('SPRING', 'SUMMER', 'FALL', 'WINTER', 'ALL_SEASON') NULL;
