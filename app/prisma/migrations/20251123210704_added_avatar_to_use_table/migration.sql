/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `creatorId` on the `Item` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[avatarId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Brand` DROP FOREIGN KEY `Brand_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `Item` DROP FOREIGN KEY `Item_creatorId_fkey`;

-- DropIndex
DROP INDEX `Brand_ownerId_fkey` ON `Brand`;

-- DropIndex
DROP INDEX `Item_creatorId_fkey` ON `Item`;

-- AlterTable
ALTER TABLE `Brand` DROP COLUMN `ownerId`,
    ADD COLUMN `authorId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Item` DROP COLUMN `creatorId`,
    ADD COLUMN `authorId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `avatarId` VARCHAR(191) NULL,
    ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `Avatar` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `imageId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Avatar_url_key`(`url`),
    UNIQUE INDEX `Avatar_imageId_key`(`imageId`),
    UNIQUE INDEX `Avatar_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Brand_authorId_fkey` ON `Brand`(`authorId`);

-- CreateIndex
CREATE INDEX `Item_creatorId_fkey` ON `Item`(`authorId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_avatarId_key` ON `User`(`avatarId`);

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Brand` ADD CONSTRAINT `Brand_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Avatar` ADD CONSTRAINT `Avatar_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `Image`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Avatar` ADD CONSTRAINT `Avatar_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
