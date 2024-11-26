-- DropIndex
DROP INDEX `SectionAttributeValue_entityReference_fkey` ON `SectionAttributeValue`;

-- CreateTable
CREATE TABLE `ToDo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `check` BOOLEAN NOT NULL DEFAULT false,
    `alert` BOOLEAN NOT NULL DEFAULT false,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `creatorId` INTEGER NOT NULL,
    `responsibleId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `todoStateId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ToDo` ADD CONSTRAINT `ToDo_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToDo` ADD CONSTRAINT `ToDo_responsibleId_fkey` FOREIGN KEY (`responsibleId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToDo` ADD CONSTRAINT `ToDo_todoStateId_fkey` FOREIGN KEY (`todoStateId`) REFERENCES `MasterOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
