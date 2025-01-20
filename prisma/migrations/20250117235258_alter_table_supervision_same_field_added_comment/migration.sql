/*
  Warnings:

  - Added the required column `coDefendant` to the `Supervision` table without a default value. This is not possible if the table is not empty.
  - Added the required column `demanded` to the `Supervision` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileCode` to the `Supervision` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plaintiff` to the `Supervision` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `JudicialProcess` ADD COLUMN `comment` VARCHAR(191) NULL DEFAULT '',
    MODIFY `fileCode` LONGTEXT NOT NULL,
    MODIFY `demanded` LONGTEXT NOT NULL,
    MODIFY `plaintiff` LONGTEXT NOT NULL,
    MODIFY `coDefendant` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `Supervision` ADD COLUMN `amount` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `cargoStudioId` INTEGER NULL,
    ADD COLUMN `coDefendant` LONGTEXT NOT NULL,
    ADD COLUMN `comment` VARCHAR(191) NULL DEFAULT '',
    ADD COLUMN `demanded` LONGTEXT NOT NULL,
    ADD COLUMN `fileCode` LONGTEXT NOT NULL,
    ADD COLUMN `plaintiff` LONGTEXT NOT NULL;

-- AddForeignKey
ALTER TABLE `Supervision` ADD CONSTRAINT `fk_supervision_studio_id` FOREIGN KEY (`cargoStudioId`) REFERENCES `MasterOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
