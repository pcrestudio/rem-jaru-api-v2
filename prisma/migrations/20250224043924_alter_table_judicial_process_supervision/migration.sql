-- AlterTable
ALTER TABLE `JudicialProcess` ADD COLUMN `paidAmount` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `savingAmount` DOUBLE NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Supervision` ADD COLUMN `paidAmount` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `savingAmount` DOUBLE NULL DEFAULT 0;
