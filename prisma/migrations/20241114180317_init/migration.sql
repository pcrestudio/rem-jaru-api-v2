-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(50) NOT NULL,
    `lastName` VARCHAR(50) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `title` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRole` (
    `userId` INTEGER NOT NULL,
    `roleId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`userId`, `roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Module` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL,
    `slug` VARCHAR(50) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Submodule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL,
    `slug` VARCHAR(50) NOT NULL DEFAULT '',
    `moduleId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Master` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `slug` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `moduleId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MasterOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `slug` VARCHAR(50) NOT NULL,
    `masterId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JudicialProcess` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileCode` VARCHAR(50) NOT NULL,
    `demanded` VARCHAR(50) NOT NULL,
    `plaintiff` VARCHAR(50) NOT NULL,
    `coDefendant` VARCHAR(50) NOT NULL,
    `submoduleId` INTEGER NOT NULL,
    `cargoStudioId` INTEGER NULL,
    `project_id` INTEGER NULL,
    `responsible_id` INTEGER NULL,
    `secondary_responsible_id` INTEGER NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `controversialMatter` VARCHAR(191) NULL DEFAULT '',
    `amount` DOUBLE NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Section` (
    `sectionId` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `collapsable` BOOLEAN NOT NULL,
    `isActive` BOOLEAN NULL DEFAULT true,
    `moduleId` INTEGER NULL,
    `submoduleId` INTEGER NULL,

    PRIMARY KEY (`sectionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SectionAttribute` (
    `sectionAttributeId` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `sectionId` INTEGER NOT NULL,
    `moduleId` INTEGER NULL,
    `submoduleId` INTEGER NULL,
    `order` INTEGER NOT NULL,
    `dataType` ENUM('TEXT', 'TEXTAREA', 'INTEGER', 'FLOAT', 'DATE', 'LIST', 'FILE', 'EMAIL', 'BOOLEAN') NOT NULL DEFAULT 'TEXT',
    `rowLayout` ENUM('single', 'twoColumns', 'threeColumns') NOT NULL,
    `isActive` BOOLEAN NULL DEFAULT true,
    `isRequired` BOOLEAN NULL DEFAULT true,

    UNIQUE INDEX `SectionAttribute_slug_key`(`slug`),
    PRIMARY KEY (`sectionAttributeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SectionAttributeOption` (
    `sectionAttributeOptionId` INTEGER NOT NULL AUTO_INCREMENT,
    `attributeId` INTEGER NOT NULL,
    `optionLabel` VARCHAR(191) NOT NULL,
    `optionValue` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`sectionAttributeOptionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SectionAttributeValue` (
    `sectionAttributeValueId` INTEGER NOT NULL AUTO_INCREMENT,
    `sectionAttributeId` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `modifiedBy` VARCHAR(191) NOT NULL,
    `entityReference` INTEGER NULL,

    PRIMARY KEY (`sectionAttributeValueId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GlobalAttribute` (
    `globalAttributeId` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `dataType` ENUM('TEXT', 'TEXTAREA', 'INTEGER', 'FLOAT', 'DATE', 'LIST', 'FILE', 'EMAIL', 'BOOLEAN') NOT NULL DEFAULT 'TEXT',
    `order` INTEGER NOT NULL,
    `rowLayout` ENUM('single', 'twoColumns', 'threeColumns') NOT NULL DEFAULT 'single',
    `isActive` BOOLEAN NULL DEFAULT true,

    UNIQUE INDEX `GlobalAttribute_slug_key`(`slug`),
    PRIMARY KEY (`globalAttributeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GlobalAttributeOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `globalAttributeId` INTEGER NOT NULL,
    `optionLabel` VARCHAR(191) NOT NULL,
    `optionValue` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GlobalAttributeValue` (
    `globalAttributeValueId` INTEGER NOT NULL AUTO_INCREMENT,
    `globalAttributeId` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `modifiedBy` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`globalAttributeValueId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttributeRule` (
    `id` VARCHAR(191) NOT NULL,
    `triggerAttributeId` INTEGER NOT NULL,
    `targetAttributeId` INTEGER NOT NULL,
    `targetValue` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Condition` (
    `id` VARCHAR(191) NOT NULL,
    `attributeRuleId` VARCHAR(191) NOT NULL,
    `attributeId` INTEGER NOT NULL,
    `operator` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `logicalOperator` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submodule` ADD CONSTRAINT `Submodule_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Master` ADD CONSTRAINT `Master_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MasterOption` ADD CONSTRAINT `MasterOption_masterId_fkey` FOREIGN KEY (`masterId`) REFERENCES `Master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JudicialProcess` ADD CONSTRAINT `JudicialProcess_submoduleId_fkey` FOREIGN KEY (`submoduleId`) REFERENCES `Submodule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JudicialProcess` ADD CONSTRAINT `fk_project_id` FOREIGN KEY (`project_id`) REFERENCES `MasterOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JudicialProcess` ADD CONSTRAINT `fk_studio_id` FOREIGN KEY (`cargoStudioId`) REFERENCES `MasterOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JudicialProcess` ADD CONSTRAINT `fk_responsible_id` FOREIGN KEY (`responsible_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JudicialProcess` ADD CONSTRAINT `fk_creator_id` FOREIGN KEY (`secondary_responsible_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_submoduleId_fkey` FOREIGN KEY (`submoduleId`) REFERENCES `Submodule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SectionAttribute` ADD CONSTRAINT `SectionAttribute_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section`(`sectionId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SectionAttribute` ADD CONSTRAINT `SectionAttribute_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SectionAttribute` ADD CONSTRAINT `SectionAttribute_submoduleId_fkey` FOREIGN KEY (`submoduleId`) REFERENCES `Submodule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SectionAttributeOption` ADD CONSTRAINT `SectionAttributeOption_attributeId_fkey` FOREIGN KEY (`attributeId`) REFERENCES `SectionAttribute`(`sectionAttributeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SectionAttributeValue` ADD CONSTRAINT `SectionAttributeValue_sectionAttributeId_fkey` FOREIGN KEY (`sectionAttributeId`) REFERENCES `SectionAttribute`(`sectionAttributeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SectionAttributeValue` ADD CONSTRAINT `SectionAttributeValue_entityReference_fkey` FOREIGN KEY (`entityReference`) REFERENCES `Submodule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GlobalAttributeOption` ADD CONSTRAINT `GlobalAttributeOption_globalAttributeId_fkey` FOREIGN KEY (`globalAttributeId`) REFERENCES `GlobalAttribute`(`globalAttributeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GlobalAttributeValue` ADD CONSTRAINT `GlobalAttributeValue_globalAttributeId_fkey` FOREIGN KEY (`globalAttributeId`) REFERENCES `GlobalAttribute`(`globalAttributeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttributeRule` ADD CONSTRAINT `AttributeRule_triggerAttributeId_fkey` FOREIGN KEY (`triggerAttributeId`) REFERENCES `SectionAttribute`(`sectionAttributeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttributeRule` ADD CONSTRAINT `AttributeRule_targetAttributeId_fkey` FOREIGN KEY (`targetAttributeId`) REFERENCES `SectionAttribute`(`sectionAttributeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Condition` ADD CONSTRAINT `Condition_attributeRuleId_fkey` FOREIGN KEY (`attributeRuleId`) REFERENCES `AttributeRule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Condition` ADD CONSTRAINT `Condition_attributeId_fkey` FOREIGN KEY (`attributeId`) REFERENCES `SectionAttribute`(`sectionAttributeId`) ON DELETE RESTRICT ON UPDATE CASCADE;
