/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resetPasswordToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `authMethod` VARCHAR(191) NOT NULL DEFAULT 'local',
    ADD COLUMN `createdBy` VARCHAR(50) NULL,
    ADD COLUMN `displayName` VARCHAR(100) NULL,
    ADD COLUMN `lastLogon` DATETIME(3) NULL,
    ADD COLUMN `otpExpires` DATETIME(3) NULL,
    ADD COLUMN `otpSecret` VARCHAR(255) NULL,
    ADD COLUMN `resetPasswordExpires` DATETIME(3) NULL,
    ADD COLUMN `resetPasswordToken` VARCHAR(255) NULL,
    ADD COLUMN `updatedBy` VARCHAR(50) NULL,
    MODIFY `firstName` VARCHAR(50) NULL,
    MODIFY `lastName` VARCHAR(50) NULL,
    MODIFY `password` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `User_resetPasswordToken_key` ON `User`(`resetPasswordToken`);
