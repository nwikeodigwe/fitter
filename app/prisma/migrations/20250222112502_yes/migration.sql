-- DropForeignKey
ALTER TABLE `Brand` DROP FOREIGN KEY `Brand_logoId_fkey`;

-- AddForeignKey
ALTER TABLE `Brand` ADD CONSTRAINT `Brand_logoId_fkey` FOREIGN KEY (`logoId`) REFERENCES `Logo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
