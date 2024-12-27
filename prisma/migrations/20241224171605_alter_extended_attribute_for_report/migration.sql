-- AlterTable
ALTER TABLE `GlobalAttribute` ADD COLUMN `isForReport` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `SectionAttribute` ADD COLUMN `isForReport` BOOLEAN NULL DEFAULT false;
