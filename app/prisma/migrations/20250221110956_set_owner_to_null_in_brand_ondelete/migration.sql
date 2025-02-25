/*
  Warnings:

  - You are about to drop the `favoriteItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Brand` DROP FOREIGN KEY `Brand_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `favoriteItem` DROP FOREIGN KEY `favoriteItem_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `favoriteItem` DROP FOREIGN KEY `favoriteItem_userId_fkey`;

-- DropTable
DROP TABLE `favoriteItem`;

-- CreateTable
CREATE TABLE `FavoriteItem` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `favoriteItem_itemId_fkey`(`itemId`),
    UNIQUE INDEX `FavoriteItem_userId_itemId_key`(`userId`, `itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Brand` ADD CONSTRAINT `Brand_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteItem` ADD CONSTRAINT `FavoriteItem_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteItem` ADD CONSTRAINT `FavoriteItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
