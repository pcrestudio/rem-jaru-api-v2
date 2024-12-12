-- CreateTable
CREATE TABLE `Supervision` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entityReference` VARCHAR(191) NULL,
    `submoduleId` INTEGER NOT NULL,
    `project_id` INTEGER NULL,
    `responsible_id` INTEGER NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Supervision_entityReference_key`(`entityReference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Supervision` ADD CONSTRAINT `Supervision_submoduleId_fkey` FOREIGN KEY (`submoduleId`) REFERENCES `Submodule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supervision` ADD CONSTRAINT `fk_supervision_project_id` FOREIGN KEY (`project_id`) REFERENCES `MasterOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supervision` ADD CONSTRAINT `fk_supervision_responsible_id` FOREIGN KEY (`responsible_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
