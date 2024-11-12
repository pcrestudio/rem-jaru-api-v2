-- CreateTable
CREATE TABLE `Section` (
    `sectionId` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `collapsable` BOOLEAN NOT NULL,

    PRIMARY KEY (`sectionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SectionAttribute` (
    `sectionAttributeId` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `sectionId` INTEGER NOT NULL,
    `order` INTEGER NOT NULL,
    `dataType` VARCHAR(191) NOT NULL,
    `rowLayout` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `SectionAttribute_slug_key`(`slug`),
    PRIMARY KEY (`sectionAttributeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SectionAttributeOption` (
    `sectionAttributeOptionId` INTEGER NOT NULL AUTO_INCREMENT,
    `attributeId` INTEGER NOT NULL,
    `optionLabel` VARCHAR(191) NOT NULL,
    `optionValue` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL,

    PRIMARY KEY (`sectionAttributeOptionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SectionAttributeValue` (
    `sectionAttributeId` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `modifiedBy` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`sectionAttributeId`, `value`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GlobalAttribute` (
    `globalAttributeId` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `dataType` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `rowLayout` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `GlobalAttribute_slug_key`(`slug`),
    PRIMARY KEY (`globalAttributeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GlobalAttributeOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `globalAttributeId` INTEGER NOT NULL,
    `optionLabel` VARCHAR(191) NOT NULL,
    `optionValue` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GlobalAttributeValue` (
    `globalAttributeId` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `modifiedBy` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`globalAttributeId`, `value`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SectionAttribute` ADD CONSTRAINT `SectionAttribute_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section`(`sectionId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SectionAttributeOption` ADD CONSTRAINT `SectionAttributeOption_attributeId_fkey` FOREIGN KEY (`attributeId`) REFERENCES `SectionAttribute`(`sectionAttributeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SectionAttributeValue` ADD CONSTRAINT `SectionAttributeValue_sectionAttributeId_fkey` FOREIGN KEY (`sectionAttributeId`) REFERENCES `SectionAttribute`(`sectionAttributeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GlobalAttributeOption` ADD CONSTRAINT `GlobalAttributeOption_globalAttributeId_fkey` FOREIGN KEY (`globalAttributeId`) REFERENCES `GlobalAttribute`(`globalAttributeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GlobalAttributeValue` ADD CONSTRAINT `GlobalAttributeValue_globalAttributeId_fkey` FOREIGN KEY (`globalAttributeId`) REFERENCES `GlobalAttribute`(`globalAttributeId`) ON DELETE RESTRICT ON UPDATE CASCADE;
