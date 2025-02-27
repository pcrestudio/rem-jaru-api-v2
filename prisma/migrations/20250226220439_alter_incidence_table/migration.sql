/*
  Warnings:

  - You are about to drop the `InstanceIncident` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InstanceIncidentData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `InstanceIncident` DROP FOREIGN KEY `InstanceIncident_instanceId_fkey`;

-- DropForeignKey
ALTER TABLE `InstanceIncidentData` DROP FOREIGN KEY `InstanceIncidentData_entityJudicialProcessReference_fkey`;

-- DropForeignKey
ALTER TABLE `InstanceIncidentData` DROP FOREIGN KEY `InstanceIncidentData_entitySupervisionReference_fkey`;

-- DropForeignKey
ALTER TABLE `InstanceIncidentData` DROP FOREIGN KEY `InstanceIncidentData_instanceIncidentId_fkey`;

-- DropTable
DROP TABLE `InstanceIncident`;

-- DropTable
DROP TABLE `InstanceIncidentData`;

-- CreateTable
CREATE TABLE `Incidence` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `instanceId` INTEGER NOT NULL,
    `name` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `entityJudicialProcessReference` VARCHAR(191) NULL,
    `entitySupervisionReference` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IncidenceData` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `incidentId` INTEGER NOT NULL,
    `headquarters` LONGTEXT NOT NULL,
    `comment` LONGTEXT NOT NULL,
    `fileCode` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Incidence` ADD CONSTRAINT `Incidence_entityJudicialProcessReference_fkey` FOREIGN KEY (`entityJudicialProcessReference`) REFERENCES `JudicialProcess`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Incidence` ADD CONSTRAINT `Incidence_entitySupervisionReference_fkey` FOREIGN KEY (`entitySupervisionReference`) REFERENCES `Supervision`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IncidenceData` ADD CONSTRAINT `IncidenceData_incidentId_fkey` FOREIGN KEY (`incidentId`) REFERENCES `Incidence`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
