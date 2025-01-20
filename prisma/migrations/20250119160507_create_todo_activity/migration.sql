-- CreateTable
CREATE TABLE `TodoActivity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `todoId` INTEGER NOT NULL,
    `activity` VARCHAR(191) NOT NULL,
    `file` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `responsibleId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TodoActivity` ADD CONSTRAINT `TodoActivity_responsibleId_fkey` FOREIGN KEY (`responsibleId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TodoActivity` ADD CONSTRAINT `TodoActivity_todoId_fkey` FOREIGN KEY (`todoId`) REFERENCES `ToDo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
