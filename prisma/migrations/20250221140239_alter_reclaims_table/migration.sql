-- AlterTable
ALTER TABLE `Reclaim` ADD COLUMN `posibleAmount` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `remoteAmount` DOUBLE NULL DEFAULT 0;
