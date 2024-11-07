-- AlterTable
ALTER TABLE `JudicialProcess` ADD COLUMN `amount` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `controversialMatter` VARCHAR(191) NULL DEFAULT '';
