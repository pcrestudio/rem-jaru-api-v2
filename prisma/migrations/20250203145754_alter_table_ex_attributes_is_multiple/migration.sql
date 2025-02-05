-- AlterTable
ALTER TABLE `GlobalAttribute` ADD COLUMN `isMultiple` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `SectionAttribute` ADD COLUMN `isMultiple` BOOLEAN NULL DEFAULT false;
