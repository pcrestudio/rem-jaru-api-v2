-- AlterTable
ALTER TABLE `GlobalAttributeValue` MODIFY `value` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `SectionAttributeValue` MODIFY `value` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `ToDo` ADD COLUMN `dateExpiration` VARCHAR(191) NULL;
