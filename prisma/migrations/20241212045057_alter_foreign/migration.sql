-- AddForeignKey
ALTER TABLE `Supervision` ADD CONSTRAINT `fk_supervision_authority_id` FOREIGN KEY (`authority_id`) REFERENCES `MasterOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supervision` ADD CONSTRAINT `fk_supervision_situation_id` FOREIGN KEY (`situation_id`) REFERENCES `MasterOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
