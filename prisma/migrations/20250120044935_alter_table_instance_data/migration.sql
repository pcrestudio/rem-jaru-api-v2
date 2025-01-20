-- AlterTable
ALTER TABLE `InstanceIncidentData` ADD COLUMN `entityJudicialProcessReference` VARCHAR(191) NULL,
    ADD COLUMN `entitySupervisionReference` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `InstanceIncidentData` ADD CONSTRAINT `InstanceIncidentData_entityJudicialProcessReference_fkey` FOREIGN KEY (`entityJudicialProcessReference`) REFERENCES `JudicialProcess`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstanceIncidentData` ADD CONSTRAINT `InstanceIncidentData_entitySupervisionReference_fkey` FOREIGN KEY (`entitySupervisionReference`) REFERENCES `Supervision`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;
