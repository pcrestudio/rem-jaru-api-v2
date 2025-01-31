-- AlterTable
ALTER TABLE `JudicialProcess` ADD COLUMN `contingencyLevel` VARCHAR(191) NULL DEFAULT '',
    ADD COLUMN `contingencyPercentage` VARCHAR(191) NULL DEFAULT '',
    ADD COLUMN `provisionAmount` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `provisionContingency` INTEGER NULL DEFAULT 0;
