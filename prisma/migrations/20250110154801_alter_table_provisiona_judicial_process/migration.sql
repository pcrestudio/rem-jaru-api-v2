-- AlterTable
ALTER TABLE `JudicialProcess` ADD COLUMN `guaranteeLetter` VARCHAR(191) NULL DEFAULT '',
    ADD COLUMN `isProvisional` BOOLEAN NULL DEFAULT false;
