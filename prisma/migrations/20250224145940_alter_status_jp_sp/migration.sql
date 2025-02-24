-- AlterTable
ALTER TABLE `JudicialProcess` ADD COLUMN `statusId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Supervision` ADD COLUMN `statusId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Supervision` ADD CONSTRAINT `fk_supervision_status_id` FOREIGN KEY (`statusId`) REFERENCES `MasterOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
