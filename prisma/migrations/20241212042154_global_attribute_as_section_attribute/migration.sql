-- AlterTable
ALTER TABLE `GlobalAttribute` ADD COLUMN `isRequired` BOOLEAN NULL DEFAULT true,
    ADD COLUMN `moduleId` INTEGER NULL,
    ADD COLUMN `submoduleId` INTEGER NULL;

-- AlterTable
ALTER TABLE `GlobalAttributeValue` ADD COLUMN `entityReference` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `SectionAttributeOption` MODIFY `isActive` BOOLEAN NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE `GlobalAttribute` ADD CONSTRAINT `GlobalAttribute_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GlobalAttribute` ADD CONSTRAINT `GlobalAttribute_submoduleId_fkey` FOREIGN KEY (`submoduleId`) REFERENCES `Submodule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
