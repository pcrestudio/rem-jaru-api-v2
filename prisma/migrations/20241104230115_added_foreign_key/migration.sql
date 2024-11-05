-- AlterTable
ALTER TABLE `JudicialProcess` ADD COLUMN `cargoStudioId` INTEGER NULL,
    ADD COLUMN `project_id` INTEGER NULL,
    ADD COLUMN `responsible_id` INTEGER NULL,
    ADD COLUMN `secondary_responsible_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `JudicialProcess` ADD CONSTRAINT `fk_project_id` FOREIGN KEY (`project_id`) REFERENCES `MasterOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JudicialProcess` ADD CONSTRAINT `fk_studio_id` FOREIGN KEY (`cargoStudioId`) REFERENCES `MasterOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JudicialProcess` ADD CONSTRAINT `fk_responsible_id` FOREIGN KEY (`responsible_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JudicialProcess` ADD CONSTRAINT `fk_creator_id` FOREIGN KEY (`secondary_responsible_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
