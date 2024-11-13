/*
  Warnings:

  - You are about to alter the column `rowLayout` on the `GlobalAttribute` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.
  - You are about to alter the column `rowLayout` on the `SectionAttribute` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.

*/
-- AlterTable
ALTER TABLE `GlobalAttribute` MODIFY `rowLayout` ENUM('single', 'twoColumns', 'threeColumns') NOT NULL DEFAULT 'single';

-- AlterTable
ALTER TABLE `SectionAttribute` ADD COLUMN `isRequired` BOOLEAN NULL DEFAULT true,
    MODIFY `rowLayout` ENUM('single', 'twoColumns', 'threeColumns') NOT NULL;
