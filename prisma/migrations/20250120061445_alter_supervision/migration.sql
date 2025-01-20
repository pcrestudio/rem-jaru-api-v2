-- DropForeignKey
ALTER TABLE `JudicialProcess` DROP FOREIGN KEY `fk_creator_id`;

-- AlterTable
ALTER TABLE `Supervision` ADD COLUMN `secondary_responsible_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `JudicialProcess` ADD CONSTRAINT `fk_supervision_creator_id` FOREIGN KEY (`secondary_responsible_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supervision` ADD CONSTRAINT `fk_creator_id` FOREIGN KEY (`secondary_responsible_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
