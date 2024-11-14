/*
  Warnings:

  - The primary key for the `GlobalAttributeValue` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SectionAttributeValue` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `globalAttributeValueId` to the `GlobalAttributeValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sectionAttributeValueId` to the `SectionAttributeValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `GlobalAttributeValue` DROP PRIMARY KEY,
    ADD COLUMN `globalAttributeValueId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`globalAttributeValueId`);

-- AlterTable
ALTER TABLE `SectionAttributeValue` DROP PRIMARY KEY,
    ADD COLUMN `sectionAttributeValueId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`sectionAttributeValueId`);
