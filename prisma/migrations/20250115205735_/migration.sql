/*
  Warnings:

  - You are about to drop the column `entityReference` on the `GlobalAttributeValue` table. All the data in the column will be lost.
  - You are about to drop the column `entityReference` on the `SectionAttributeValue` table. All the data in the column will be lost.
  - You are about to drop the column `entityReference` on the `StepData` table. All the data in the column will be lost.
  - Added the required column `modelType` to the `GlobalAttributeValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelType` to the `SectionAttributeValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelType` to the `StepData` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `GlobalAttributeValue` DROP FOREIGN KEY `GlobalAttributeValue_entityReference_fkey`;

-- DropForeignKey
ALTER TABLE `SectionAttributeValue` DROP FOREIGN KEY `SectionAttributeValue_entityReference_fkey`;

-- DropForeignKey
ALTER TABLE `StepData` DROP FOREIGN KEY `StepData_entityReference_fkey`;

-- AlterTable
ALTER TABLE `GlobalAttributeValue` DROP COLUMN `entityReference`,
    ADD COLUMN `entityJudicialProcessReference` VARCHAR(191) NULL,
    ADD COLUMN `entitySupervisionReference` VARCHAR(191) NULL,
    ADD COLUMN `modelType` ENUM('JudicialProcess', 'Supervision') NOT NULL;

-- AlterTable
ALTER TABLE `SectionAttributeValue` DROP COLUMN `entityReference`,
    ADD COLUMN `entityJudicialProcessReference` VARCHAR(191) NULL,
    ADD COLUMN `entitySupervisionReference` VARCHAR(191) NULL,
    ADD COLUMN `modelType` ENUM('JudicialProcess', 'Supervision') NOT NULL;

-- AlterTable
ALTER TABLE `StepData` DROP COLUMN `entityReference`,
    ADD COLUMN `entityJudicialProcessReference` VARCHAR(191) NULL,
    ADD COLUMN `entitySupervisionReference` VARCHAR(191) NULL,
    ADD COLUMN `modelType` ENUM('JudicialProcess', 'Supervision') NOT NULL;

-- AddForeignKey
ALTER TABLE `SectionAttributeValue` ADD CONSTRAINT `SectionAttributeValue_entityJudicialProcessReference_fkey` FOREIGN KEY (`entityJudicialProcessReference`) REFERENCES `JudicialProcess`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SectionAttributeValue` ADD CONSTRAINT `SectionAttributeValue_entitySupervisionReference_fkey` FOREIGN KEY (`entitySupervisionReference`) REFERENCES `Supervision`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GlobalAttributeValue` ADD CONSTRAINT `GlobalAttributeValue_entityJudicialProcessReference_fkey` FOREIGN KEY (`entityJudicialProcessReference`) REFERENCES `JudicialProcess`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GlobalAttributeValue` ADD CONSTRAINT `GlobalAttributeValue_entitySupervisionReference_fkey` FOREIGN KEY (`entitySupervisionReference`) REFERENCES `Supervision`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StepData` ADD CONSTRAINT `StepData_entityJudicialProcessReference_fkey` FOREIGN KEY (`entityJudicialProcessReference`) REFERENCES `JudicialProcess`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StepData` ADD CONSTRAINT `StepData_entitySupervisionReference_fkey` FOREIGN KEY (`entitySupervisionReference`) REFERENCES `Supervision`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;
