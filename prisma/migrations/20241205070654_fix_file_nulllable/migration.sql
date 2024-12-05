/*
  Warnings:

  - A unique constraint covering the columns `[entityId]` on the table `StepData` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Master` DROP FOREIGN KEY `Master_moduleId_fkey`;

-- AlterTable
ALTER TABLE `Master` MODIFY `moduleId` INTEGER NULL;

-- AlterTable
ALTER TABLE `StepData` MODIFY `file` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `StepData_entityId_key` ON `StepData`(`entityId`);

-- AddForeignKey
ALTER TABLE `Master` ADD CONSTRAINT `Master_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
