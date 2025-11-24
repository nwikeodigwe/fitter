/*
  Warnings:

  - You are about to drop the column `colorScheme` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Item` DROP COLUMN `colorScheme`,
    ADD COLUMN `colorway` VARCHAR(191) NULL;
