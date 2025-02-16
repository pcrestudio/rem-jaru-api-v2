-- DropForeignKey
ALTER TABLE `JudicialProcess` DROP FOREIGN KEY `fk_studio_id`;

-- DropIndex
DROP INDEX `fk_studio_id` ON `JudicialProcess`;

-- AddForeignKey
ALTER TABLE `JudicialProcess` ADD CONSTRAINT `fk_studio_id` FOREIGN KEY (`cargoStudioId`) REFERENCES `MasterOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
