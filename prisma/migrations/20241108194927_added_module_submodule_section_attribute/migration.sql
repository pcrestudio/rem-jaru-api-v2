-- AlterTable
ALTER TABLE `SectionAttribute` ADD COLUMN `moduleId` INTEGER NULL,
    ADD COLUMN `submoduleId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `SectionAttribute` ADD CONSTRAINT `SectionAttribute_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SectionAttribute` ADD CONSTRAINT `SectionAttribute_submoduleId_fkey` FOREIGN KEY (`submoduleId`) REFERENCES `Submodule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
