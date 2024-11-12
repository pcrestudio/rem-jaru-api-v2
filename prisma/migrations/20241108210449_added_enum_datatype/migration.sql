/*
  Warnings:

  - You are about to alter the column `dataType` on the `GlobalAttribute` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - You are about to alter the column `dataType` on the `SectionAttribute` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `GlobalAttribute` MODIFY `dataType` ENUM('TEXT', 'TEXTAREA', 'INTEGER', 'FLOAT', 'DATE', 'LIST', 'FILE', 'EMAIL', 'BOOLEAN') NOT NULL DEFAULT 'TEXT';

-- AlterTable
ALTER TABLE `SectionAttribute` MODIFY `dataType` ENUM('TEXT', 'TEXTAREA', 'INTEGER', 'FLOAT', 'DATE', 'LIST', 'FILE', 'EMAIL', 'BOOLEAN') NOT NULL DEFAULT 'TEXT';
