/*
  Warnings:

  - A unique constraint covering the columns `[entityReference]` on the table `JudicialProcess` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `JudicialProcess` ADD COLUMN `entityReference` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `JudicialProcess_entityReference_key` ON `JudicialProcess`(`entityReference`);
