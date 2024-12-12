-- AlterTable
ALTER TABLE `Master` ADD COLUMN `submoduleId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Master` ADD CONSTRAINT `Master_submoduleId_fkey` FOREIGN KEY (`submoduleId`) REFERENCES `Submodule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
