-- AlterTable
ALTER TABLE `Step` ADD COLUMN `entityReference` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `StepData` ADD COLUMN `title` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `JudicialProcess` ADD CONSTRAINT `fk_status_id` FOREIGN KEY (`statusId`) REFERENCES `MasterOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
