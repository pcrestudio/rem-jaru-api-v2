/*
  Warnings:

  - You are about to drop the column `completed` on the `Instance` table. All the data in the column will be lost.
  - You are about to drop the column `comments` on the `Step` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `Step` table. All the data in the column will be lost.
  - You are about to drop the column `entityId` on the `Step` table. All the data in the column will be lost.
  - You are about to drop the column `entityReference` on the `Step` table. All the data in the column will be lost.
  - You are about to drop the column `file` on the `Step` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Instance` DROP COLUMN `completed`;

-- AlterTable
ALTER TABLE `Step` DROP COLUMN `comments`,
    DROP COLUMN `completed`,
    DROP COLUMN `entityId`,
    DROP COLUMN `entityReference`,
    DROP COLUMN `file`,
    ADD COLUMN `isGlobal` BOOLEAN NULL DEFAULT false;

-- CreateTable
CREATE TABLE `StepData` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `comments` VARCHAR(191) NOT NULL,
    `file` VARCHAR(191) NOT NULL,
    `stepId` INTEGER NOT NULL,
    `entityReference` VARCHAR(191) NULL,
    `entityId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StepData` ADD CONSTRAINT `StepData_stepId_fkey` FOREIGN KEY (`stepId`) REFERENCES `Step`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
