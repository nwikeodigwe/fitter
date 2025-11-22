/*
  Warnings:

  - You are about to drop the column `logoId` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the `Logo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Brand` DROP FOREIGN KEY `Brand_logoId_fkey`;

-- DropForeignKey
ALTER TABLE `Logo` DROP FOREIGN KEY `Logo_imageId_fkey`;

-- DropIndex
DROP INDEX `Brand_logoId_key` ON `Brand`;

-- AlterTable
ALTER TABLE `Brand` DROP COLUMN `logoId`,
    ADD COLUMN `releaseYear` INTEGER NULL;

-- AlterTable
ALTER TABLE `Collection` ADD COLUMN `releaseYear` INTEGER NULL;

-- AlterTable
ALTER TABLE `Style` ADD COLUMN `releaseYear` INTEGER NULL;

-- DropTable
DROP TABLE `Logo`;

-- CreateTable
CREATE TABLE `_BrandImage` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_BrandImage_AB_unique`(`A`, `B`),
    INDEX `_BrandImage_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CollectionImage` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CollectionImage_AB_unique`(`A`, `B`),
    INDEX `_CollectionImage_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_StyleImage` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_StyleImage_AB_unique`(`A`, `B`),
    INDEX `_StyleImage_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_BrandImage` ADD CONSTRAINT `_BrandImage_A_fkey` FOREIGN KEY (`A`) REFERENCES `Brand`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BrandImage` ADD CONSTRAINT `_BrandImage_B_fkey` FOREIGN KEY (`B`) REFERENCES `Image`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CollectionImage` ADD CONSTRAINT `_CollectionImage_A_fkey` FOREIGN KEY (`A`) REFERENCES `Collection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CollectionImage` ADD CONSTRAINT `_CollectionImage_B_fkey` FOREIGN KEY (`B`) REFERENCES `Image`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_StyleImage` ADD CONSTRAINT `_StyleImage_A_fkey` FOREIGN KEY (`A`) REFERENCES `Image`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_StyleImage` ADD CONSTRAINT `_StyleImage_B_fkey` FOREIGN KEY (`B`) REFERENCES `Style`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
