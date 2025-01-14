-- AddForeignKey
ALTER TABLE `SectionAttributeValue` ADD CONSTRAINT `SectionAttributeValue_entityReference_fkey` FOREIGN KEY (`entityReference`) REFERENCES `JudicialProcess`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;
