/*
  Warnings:

  - Made the column `category` on table `Item` required. This step will fail if there are existing NULL values in that column.

*/
UPDATE `Item` SET `category` = 'UNCATEGORIZED' WHERE `category` IS NULL;

-- Then alter the table
ALTER TABLE `Item` 
ADD COLUMN `material` VARCHAR(191) NULL,
MODIFY `category` ENUM('APPAREL', 'SHOE', 'COLLECTIBLE', 'ACCESSORY', 'UNCATEGORIZED') NOT NULL DEFAULT 'UNCATEGORIZED';
