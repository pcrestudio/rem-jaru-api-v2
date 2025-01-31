/*
  Warnings:

  - You are about to alter the column `contingencyPercentage` on the `Reclaim` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `Reclaim` MODIFY `contingencyPercentage` INTEGER NULL DEFAULT 0;
