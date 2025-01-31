-- AlterTable
ALTER TABLE `Supervision` ADD COLUMN `contingencyLevel` VARCHAR(191) NULL DEFAULT '',
    ADD COLUMN `contingencyPercentage` VARCHAR(191) NULL DEFAULT '',
    ADD COLUMN `provisionAmount` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `provisionContingency` INTEGER NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Reclaim` (
    `reclaimId` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `contingencyPercentage` VARCHAR(191) NULL DEFAULT '',
    `contingencyLevel` VARCHAR(191) NULL DEFAULT '',
    `provisionContingency` INTEGER NULL DEFAULT 0,
    `provisionAmount` DOUBLE NULL DEFAULT 0,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `entityJudicialProcessReference` VARCHAR(191) NULL,
    `entitySupervisionReference` VARCHAR(191) NULL,

    PRIMARY KEY (`reclaimId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Reclaim` ADD CONSTRAINT `Reclaim_entityJudicialProcessReference_fkey` FOREIGN KEY (`entityJudicialProcessReference`) REFERENCES `JudicialProcess`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reclaim` ADD CONSTRAINT `Reclaim_entitySupervisionReference_fkey` FOREIGN KEY (`entitySupervisionReference`) REFERENCES `Supervision`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;
