/*
  Warnings:

  - You are about to alter the column `expedientePJ` on the `CEJ_Expedientes` table. The data in that column could be lost. The data in that column will be cast from `VarChar(1000)` to `VarChar(100)`.
  - A unique constraint covering the columns `[expedientePJ]` on the table `CEJ_Expedientes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `CEJ_Expedientes` MODIFY `expedientePJ` VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CEJ_Expedientes_expedientePJ_key` ON `CEJ_Expedientes`(`expedientePJ`);
