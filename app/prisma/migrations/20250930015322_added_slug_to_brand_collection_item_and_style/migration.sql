/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Brand` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Collection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Style` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Brand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Collection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Style` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add slug columns as nullable
ALTER TABLE `Brand` ADD COLUMN `slug` VARCHAR(191) NULL;
ALTER TABLE `Collection` ADD COLUMN `slug` VARCHAR(191) NULL;
ALTER TABLE `Item` ADD COLUMN `slug` VARCHAR(191) NULL;
ALTER TABLE `Style` ADD COLUMN `slug` VARCHAR(191) NULL;

-- Step 2: Backfill unique slugs for existing rows
UPDATE `Brand` 
SET slug = CONCAT('brand-', id) 
WHERE slug IS NULL OR slug = '';

UPDATE `Collection` 
SET slug = CONCAT('collection-', id) 
WHERE slug IS NULL OR slug = '';

UPDATE `Item` 
SET slug = CONCAT('item-', id) 
WHERE slug IS NULL OR slug = '';

UPDATE `Style` 
SET slug = CONCAT('style-', id) 
WHERE slug IS NULL OR slug = '';

-- Step 3: Make slug NOT NULL
ALTER TABLE `Brand` MODIFY `slug` VARCHAR(191) NOT NULL;
ALTER TABLE `Collection` MODIFY `slug` VARCHAR(191) NOT NULL;
ALTER TABLE `Item` MODIFY `slug` VARCHAR(191) NOT NULL;
ALTER TABLE `Style` MODIFY `slug` VARCHAR(191) NOT NULL;

-- Step 4: Add unique indexes
CREATE UNIQUE INDEX `Brand_slug_key` ON `Brand`(`slug`);
CREATE UNIQUE INDEX `Collection_slug_key` ON `Collection`(`slug`);
CREATE UNIQUE INDEX `Item_slug_key` ON `Item`(`slug`);
CREATE UNIQUE INDEX `Style_slug_key` ON `Style`(`slug`);
-- Note: If any of the above steps fail, please address the issues (e.g., duplicate slugs) and re-run the migration.