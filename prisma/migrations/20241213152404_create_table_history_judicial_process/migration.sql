-- CreateTable
CREATE TABLE `SectionAttributeValueHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sectionAttributeValueId` INTEGER NOT NULL,
    `oldValue` VARCHAR(191) NULL,
    `changeDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `changedBy` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SectionAttributeValueHistory` ADD CONSTRAINT `SectionAttributeValueHistory_sectionAttributeValueId_fkey` FOREIGN KEY (`sectionAttributeValueId`) REFERENCES `SectionAttributeValue`(`sectionAttributeValueId`) ON DELETE RESTRICT ON UPDATE CASCADE;
