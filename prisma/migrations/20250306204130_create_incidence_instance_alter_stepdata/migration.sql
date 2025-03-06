-- AlterTable
ALTER TABLE `StepData` ADD COLUMN `incidenceId` INTEGER NULL;

-- CreateTable
CREATE TABLE `IncidenceInstance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `incidenceId` INTEGER NOT NULL,
    `instanceId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `stepId` INTEGER NULL,

    UNIQUE INDEX `IncidenceInstance_incidenceId_instanceId_key`(`incidenceId`, `instanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `IncidenceInstance` ADD CONSTRAINT `IncidenceInstance_incidenceId_fkey` FOREIGN KEY (`incidenceId`) REFERENCES `Incidence`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IncidenceInstance` ADD CONSTRAINT `IncidenceInstance_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IncidenceInstance` ADD CONSTRAINT `IncidenceInstance_stepId_fkey` FOREIGN KEY (`stepId`) REFERENCES `Step`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StepData` ADD CONSTRAINT `StepData_incidenceId_fkey` FOREIGN KEY (`incidenceId`) REFERENCES `Incidence`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
