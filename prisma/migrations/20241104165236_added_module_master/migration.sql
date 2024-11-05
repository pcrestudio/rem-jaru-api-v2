/*
  Warnings:

  - Added the required column `moduleId` to the `Master` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Master` ADD COLUMN `moduleId` INTEGER NOT NULL,
    ADD COLUMN `slug` VARCHAR(50) NULL;

-- AlterTable
ALTER TABLE `Module` ADD COLUMN `slug` VARCHAR(50) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `Submodule` ADD COLUMN `slug` VARCHAR(50) NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE `JudicialProcess` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileCode` VARCHAR(50) NOT NULL,
    `demanded` VARCHAR(50) NOT NULL,
    `plaintiff` VARCHAR(50) NOT NULL,
    `coDefendant` VARCHAR(50) NOT NULL,
    `submoduleId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Master` ADD CONSTRAINT `Master_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JudicialProcess` ADD CONSTRAINT `JudicialProcess_submoduleId_fkey` FOREIGN KEY (`submoduleId`) REFERENCES `Submodule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
