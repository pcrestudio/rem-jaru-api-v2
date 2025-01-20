-- CreateTable
CREATE TABLE `InstanceIncident` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `instanceId` INTEGER NOT NULL,
    `name` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InstanceIncidentData` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `instanceIncidentId` INTEGER NOT NULL,
    `headquarters` LONGTEXT NOT NULL,
    `comment` LONGTEXT NOT NULL,
    `fileCode` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InstanceIncident` ADD CONSTRAINT `InstanceIncident_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstanceIncidentData` ADD CONSTRAINT `InstanceIncidentData_instanceIncidentId_fkey` FOREIGN KEY (`instanceIncidentId`) REFERENCES `InstanceIncident`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
