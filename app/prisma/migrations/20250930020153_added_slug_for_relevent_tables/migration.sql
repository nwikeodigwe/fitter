-- AlterTable
ALTER TABLE `Brand` ADD COLUMN `published` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Collection` ADD COLUMN `published` BOOLEAN NOT NULL DEFAULT false;
