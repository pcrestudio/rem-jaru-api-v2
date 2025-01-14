-- AddForeignKey
ALTER TABLE `GlobalAttributeValue` ADD CONSTRAINT `GlobalAttributeValue_entityReference_fkey` FOREIGN KEY (`entityReference`) REFERENCES `JudicialProcess`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;
