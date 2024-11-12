-- AlterTable
ALTER TABLE `Section` ADD COLUMN `moduleId` INTEGER NULL,
    ADD COLUMN `submoduleId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_submoduleId_fkey` FOREIGN KEY (`submoduleId`) REFERENCES `Submodule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
