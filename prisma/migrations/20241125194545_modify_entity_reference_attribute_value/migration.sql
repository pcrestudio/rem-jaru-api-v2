-- DropForeignKey
ALTER TABLE `SectionAttributeValue` DROP FOREIGN KEY `SectionAttributeValue_entityReference_fkey`;

-- AlterTable
ALTER TABLE `SectionAttributeValue` MODIFY `entityReference` VARCHAR(191) NULL;
