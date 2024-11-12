-- AlterTable
ALTER TABLE `GlobalAttribute` ADD COLUMN `isActive` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `GlobalAttributeOption` MODIFY `isActive` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `Section` ADD COLUMN `isActive` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `SectionAttribute` ADD COLUMN `isActive` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `SectionAttributeOption` MODIFY `isActive` BOOLEAN NOT NULL DEFAULT true;
