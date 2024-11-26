-- DropForeignKey
ALTER TABLE `Instance` DROP FOREIGN KEY `Instance_submoduleId_fkey`;

-- AlterTable
ALTER TABLE `Instance` ADD COLUMN `isGlobal` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `moduleId` INTEGER NULL,
    MODIFY `submoduleId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Step` ADD COLUMN `entityId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Instance` ADD CONSTRAINT `Instance_submoduleId_fkey` FOREIGN KEY (`submoduleId`) REFERENCES `Submodule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Instance` ADD CONSTRAINT `Instance_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
