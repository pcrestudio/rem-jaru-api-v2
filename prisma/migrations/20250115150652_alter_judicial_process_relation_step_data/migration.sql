-- AddForeignKey
ALTER TABLE `StepData` ADD CONSTRAINT `StepData_entityReference_fkey` FOREIGN KEY (`entityReference`) REFERENCES `JudicialProcess`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;
