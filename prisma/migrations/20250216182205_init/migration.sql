-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(50) NOT NULL,
    `firstName` VARCHAR(50) NULL,
    `lastName` VARCHAR(50) NULL,
    `displayName` VARCHAR(100) NULL,
    `authMethod` VARCHAR(191) NOT NULL DEFAULT 'local',
    `password` VARCHAR(255) NULL,
    `passwordChangedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resetPasswordToken` VARCHAR(255) NULL,
    `resetPasswordExpires` DATETIME(3) NULL,
    `otpSecret` VARCHAR(255) NULL,
    `otpExpires` DATETIME(3) NULL,
    `failedOtpAttempts` INTEGER NULL DEFAULT 0,
    `lastLogon` DATETIME(3) NULL,
    `failedLoginAttempts` INTEGER NULL DEFAULT 0,
    `isLocked` BOOLEAN NOT NULL DEFAULT false,
    `lockedAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(50) NULL,
    `updatedAt` DATETIME(3) NULL,
    `updatedBy` VARCHAR(50) NULL,
    `studioId` INTEGER NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_resetPasswordToken_key`(`resetPasswordToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PasswordHistory_userId_idx`(`userId`),
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
    `name` LONGTEXT NOT NULL,
    `slug` LONGTEXT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `moduleId` INTEGER NULL,
    `submoduleId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MasterOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` LONGTEXT NOT NULL,
    `slug` LONGTEXT NOT NULL,
    `masterId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JudicialProcess` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileCode` LONGTEXT NOT NULL,
    `demanded` LONGTEXT NOT NULL,
    `plaintiff` LONGTEXT NOT NULL,
    `coDefendant` LONGTEXT NOT NULL,
    `entityReference` VARCHAR(191) NULL,
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
    `isProvisional` BOOLEAN NULL DEFAULT false,
    `guaranteeLetter` VARCHAR(191) NULL DEFAULT '',
    `comment` VARCHAR(191) NULL DEFAULT '',
    `contingencyLevel` VARCHAR(191) NULL DEFAULT '',
    `contingencyPercentage` VARCHAR(191) NULL DEFAULT '',
    `provisionContingency` INTEGER NULL DEFAULT 0,
    `provisionAmount` DOUBLE NULL DEFAULT 0,

    UNIQUE INDEX `JudicialProcess_entityReference_key`(`entityReference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Supervision` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileCode` LONGTEXT NOT NULL,
    `demanded` LONGTEXT NOT NULL,
    `plaintiff` LONGTEXT NOT NULL,
    `coDefendant` LONGTEXT NOT NULL,
    `entityReference` VARCHAR(191) NULL,
    `submoduleId` INTEGER NOT NULL,
    `cargoStudioId` INTEGER NULL,
    `project_id` INTEGER NULL,
    `responsible_id` INTEGER NULL,
    `secondary_responsible_id` INTEGER NULL,
    `authority_id` INTEGER NULL,
    `situation_id` INTEGER NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `controversialMatter` VARCHAR(191) NULL DEFAULT '',
    `amount` DOUBLE NULL DEFAULT 0,
    `isProvisional` BOOLEAN NULL DEFAULT false,
    `guaranteeLetter` VARCHAR(191) NULL DEFAULT '',
    `comment` VARCHAR(191) NULL DEFAULT '',
    `contingencyLevel` VARCHAR(191) NULL DEFAULT '',
    `contingencyPercentage` VARCHAR(191) NULL DEFAULT '',
    `provisionContingency` INTEGER NULL DEFAULT 0,
    `provisionAmount` DOUBLE NULL DEFAULT 0,

    UNIQUE INDEX `Supervision_entityReference_key`(`entityReference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reclaim` (
    `reclaimId` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `contingencyPercentage` INTEGER NULL DEFAULT 0,
    `contingencyLevel` VARCHAR(191) NULL DEFAULT '',
    `concept` VARCHAR(191) NULL DEFAULT '',
    `provisionContingency` INTEGER NULL DEFAULT 0,
    `provisionAmount` DOUBLE NULL DEFAULT 0,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `entityJudicialProcessReference` VARCHAR(191) NULL,
    `entitySupervisionReference` VARCHAR(191) NULL,

    PRIMARY KEY (`reclaimId`)
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
    `isForReport` BOOLEAN NULL DEFAULT false,
    `isMultiple` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `SectionAttribute_slug_key`(`slug`),
    PRIMARY KEY (`sectionAttributeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SectionAttributeOption` (
    `sectionAttributeOptionId` INTEGER NOT NULL AUTO_INCREMENT,
    `attributeId` INTEGER NOT NULL,
    `optionLabel` VARCHAR(191) NOT NULL,
    `optionValue` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`sectionAttributeOptionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SectionAttributeValue` (
    `sectionAttributeValueId` INTEGER NOT NULL AUTO_INCREMENT,
    `sectionAttributeId` INTEGER NOT NULL,
    `value` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `modifiedBy` VARCHAR(191) NOT NULL,
    `modelType` ENUM('JudicialProcess', 'Supervision') NOT NULL,
    `entityJudicialProcessReference` VARCHAR(191) NULL,
    `entitySupervisionReference` VARCHAR(191) NULL,

    PRIMARY KEY (`sectionAttributeValueId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SectionAttributeValueHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sectionAttributeValueId` INTEGER NOT NULL,
    `oldValue` LONGTEXT NULL,
    `changeDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `changedBy` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GlobalAttribute` (
    `globalAttributeId` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `dataType` ENUM('TEXT', 'TEXTAREA', 'INTEGER', 'FLOAT', 'DATE', 'LIST', 'FILE', 'EMAIL', 'BOOLEAN') NOT NULL DEFAULT 'TEXT',
    `moduleId` INTEGER NULL,
    `submoduleId` INTEGER NULL,
    `order` INTEGER NOT NULL,
    `rowLayout` ENUM('single', 'twoColumns', 'threeColumns') NOT NULL DEFAULT 'single',
    `isActive` BOOLEAN NULL DEFAULT true,
    `isRequired` BOOLEAN NULL DEFAULT true,
    `isForReport` BOOLEAN NULL DEFAULT false,
    `isMultiple` BOOLEAN NULL DEFAULT false,
    `conditionalRender` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `GlobalAttribute_slug_key`(`slug`),
    PRIMARY KEY (`globalAttributeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GlobalAttributeOption` (
    `globalAttributeOptionId` INTEGER NOT NULL AUTO_INCREMENT,
    `globalAttributeId` INTEGER NOT NULL,
    `optionLabel` VARCHAR(191) NOT NULL,
    `optionValue` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`globalAttributeOptionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GlobalAttributeValue` (
    `globalAttributeValueId` INTEGER NOT NULL AUTO_INCREMENT,
    `globalAttributeId` INTEGER NOT NULL,
    `value` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `modifiedBy` VARCHAR(191) NOT NULL,
    `modelType` ENUM('JudicialProcess', 'Supervision') NOT NULL,
    `entityJudicialProcessReference` VARCHAR(191) NULL,
    `entitySupervisionReference` VARCHAR(191) NULL,

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

-- CreateTable
CREATE TABLE `ToDo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `check` BOOLEAN NOT NULL DEFAULT false,
    `alert` BOOLEAN NOT NULL DEFAULT false,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `creatorId` INTEGER NOT NULL,
    `responsibleId` INTEGER NOT NULL,
    `dateExpiration` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `todoStateId` INTEGER NOT NULL,
    `entityReference` VARCHAR(191) NULL,
    `entityStepReference` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TodoActivity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `todoId` INTEGER NOT NULL,
    `activity` VARCHAR(191) NOT NULL,
    `file` VARCHAR(191) NULL DEFAULT '',
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `responsibleId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Instance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `moduleId` INTEGER NULL,
    `submoduleId` INTEGER NULL,
    `isGlobal` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `entityJudicialProcessReference` VARCHAR(191) NULL,
    `entitySupervisionReference` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Step` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `instanceId` INTEGER NOT NULL,
    `isGlobal` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StepData` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `comments` VARCHAR(191) NOT NULL,
    `stepId` INTEGER NOT NULL,
    `modelType` ENUM('JudicialProcess', 'Supervision') NOT NULL,
    `entityJudicialProcessReference` VARCHAR(191) NULL,
    `entitySupervisionReference` VARCHAR(191) NULL,
    `file` VARCHAR(191) NULL,
    `fileTwo` VARCHAR(191) NULL,
    `fileThree` VARCHAR(191) NULL,
    `fileFour` VARCHAR(191) NULL,
    `fileFive` VARCHAR(191) NULL,
    `choice` VARCHAR(191) NULL,
    `resume` VARCHAR(191) NULL,
    `dateResume` VARCHAR(191) NULL,
    `entityId` VARCHAR(191) NULL,
    `completed` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `StepData_entityId_key`(`entityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CEJ_Expedientes` (
    `idExpediente` INTEGER NOT NULL AUTO_INCREMENT,
    `expedientePJ` VARCHAR(100) NOT NULL,
    `cuadernos` INTEGER NOT NULL DEFAULT 0,
    `actuaciones` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `juzgado` VARCHAR(1000) NULL,
    `partes` VARCHAR(1000) NULL,
    `activo` VARCHAR(1) NULL,

    UNIQUE INDEX `CEJ_Expedientes_expedientePJ_key`(`expedientePJ`),
    PRIMARY KEY (`idExpediente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CEJ_ExpedientesUsuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario` VARCHAR(191) NOT NULL,
    `IdExpediente` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CEJ_ExpedientesActuaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idExpediente` INTEGER NULL,
    `idActuacion` VARCHAR(255) NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolucion` VARCHAR(80) NULL,
    `tiponotificacion` VARCHAR(255) NULL,
    `acto` VARCHAR(255) NULL,
    `fojas` VARCHAR(50) NULL,
    `proveido` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sumilla` VARCHAR(1000) NULL,
    `descripcion_usr` VARCHAR(255) NULL,
    `resolucion_archivo` VARCHAR(150) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idProcesoUltimo` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Exchange` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `value` DOUBLE NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_studioId_fkey` FOREIGN KEY (`studioId`) REFERENCES `MasterOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordHistory` ADD CONSTRAINT `PasswordHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submodule` ADD CONSTRAINT `Submodule_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Master` ADD CONSTRAINT `Master_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Master` ADD CONSTRAINT `Master_submoduleId_fkey` FOREIGN KEY (`submoduleId`) REFERENCES `Submodule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MasterOption` ADD CONSTRAINT `MasterOption_masterId_fkey` FOREIGN KEY (`masterId`) REFERENCES `Master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JudicialProcess` ADD CONSTRAINT `JudicialProcess_submoduleId_fkey` FOREIGN KEY (`submoduleId`) REFERENCES `Submodule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JudicialProcess` ADD CONSTRAINT `fk_project_id` FOREIGN KEY (`project_id`) REFERENCES `MasterOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JudicialProcess` ADD CONSTRAINT `fk_studio_id` FOREIGN KEY (`cargoStudioId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JudicialProcess` ADD CONSTRAINT `fk_responsible_id` FOREIGN KEY (`responsible_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JudicialProcess` ADD CONSTRAINT `fk_supervision_creator_id` FOREIGN KEY (`secondary_responsible_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supervision` ADD CONSTRAINT `Supervision_submoduleId_fkey` FOREIGN KEY (`submoduleId`) REFERENCES `Submodule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supervision` ADD CONSTRAINT `fk_supervision_project_id` FOREIGN KEY (`project_id`) REFERENCES `MasterOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supervision` ADD CONSTRAINT `fk_supervision_studio_id` FOREIGN KEY (`cargoStudioId`) REFERENCES `MasterOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supervision` ADD CONSTRAINT `fk_supervision_authority_id` FOREIGN KEY (`authority_id`) REFERENCES `MasterOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supervision` ADD CONSTRAINT `fk_supervision_situation_id` FOREIGN KEY (`situation_id`) REFERENCES `MasterOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supervision` ADD CONSTRAINT `fk_supervision_responsible_id` FOREIGN KEY (`responsible_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supervision` ADD CONSTRAINT `fk_creator_id` FOREIGN KEY (`secondary_responsible_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reclaim` ADD CONSTRAINT `Reclaim_entityJudicialProcessReference_fkey` FOREIGN KEY (`entityJudicialProcessReference`) REFERENCES `JudicialProcess`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reclaim` ADD CONSTRAINT `Reclaim_entitySupervisionReference_fkey` FOREIGN KEY (`entitySupervisionReference`) REFERENCES `Supervision`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `SectionAttributeValue` ADD CONSTRAINT `SectionAttributeValue_entityJudicialProcessReference_fkey` FOREIGN KEY (`entityJudicialProcessReference`) REFERENCES `JudicialProcess`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SectionAttributeValue` ADD CONSTRAINT `SectionAttributeValue_entitySupervisionReference_fkey` FOREIGN KEY (`entitySupervisionReference`) REFERENCES `Supervision`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SectionAttributeValueHistory` ADD CONSTRAINT `SectionAttributeValueHistory_sectionAttributeValueId_fkey` FOREIGN KEY (`sectionAttributeValueId`) REFERENCES `SectionAttributeValue`(`sectionAttributeValueId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GlobalAttribute` ADD CONSTRAINT `GlobalAttribute_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GlobalAttribute` ADD CONSTRAINT `GlobalAttribute_submoduleId_fkey` FOREIGN KEY (`submoduleId`) REFERENCES `Submodule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GlobalAttributeOption` ADD CONSTRAINT `GlobalAttributeOption_globalAttributeId_fkey` FOREIGN KEY (`globalAttributeId`) REFERENCES `GlobalAttribute`(`globalAttributeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GlobalAttributeValue` ADD CONSTRAINT `GlobalAttributeValue_entityJudicialProcessReference_fkey` FOREIGN KEY (`entityJudicialProcessReference`) REFERENCES `JudicialProcess`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GlobalAttributeValue` ADD CONSTRAINT `GlobalAttributeValue_entitySupervisionReference_fkey` FOREIGN KEY (`entitySupervisionReference`) REFERENCES `Supervision`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE `ToDo` ADD CONSTRAINT `ToDo_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToDo` ADD CONSTRAINT `ToDo_responsibleId_fkey` FOREIGN KEY (`responsibleId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToDo` ADD CONSTRAINT `ToDo_todoStateId_fkey` FOREIGN KEY (`todoStateId`) REFERENCES `MasterOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TodoActivity` ADD CONSTRAINT `TodoActivity_responsibleId_fkey` FOREIGN KEY (`responsibleId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TodoActivity` ADD CONSTRAINT `TodoActivity_todoId_fkey` FOREIGN KEY (`todoId`) REFERENCES `ToDo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Instance` ADD CONSTRAINT `Instance_submoduleId_fkey` FOREIGN KEY (`submoduleId`) REFERENCES `Submodule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Instance` ADD CONSTRAINT `Instance_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstanceIncident` ADD CONSTRAINT `InstanceIncident_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstanceIncidentData` ADD CONSTRAINT `InstanceIncidentData_instanceIncidentId_fkey` FOREIGN KEY (`instanceIncidentId`) REFERENCES `InstanceIncident`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstanceIncidentData` ADD CONSTRAINT `InstanceIncidentData_entityJudicialProcessReference_fkey` FOREIGN KEY (`entityJudicialProcessReference`) REFERENCES `JudicialProcess`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstanceIncidentData` ADD CONSTRAINT `InstanceIncidentData_entitySupervisionReference_fkey` FOREIGN KEY (`entitySupervisionReference`) REFERENCES `Supervision`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Step` ADD CONSTRAINT `Step_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `Instance`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StepData` ADD CONSTRAINT `StepData_stepId_fkey` FOREIGN KEY (`stepId`) REFERENCES `Step`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StepData` ADD CONSTRAINT `StepData_entityJudicialProcessReference_fkey` FOREIGN KEY (`entityJudicialProcessReference`) REFERENCES `JudicialProcess`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StepData` ADD CONSTRAINT `StepData_entitySupervisionReference_fkey` FOREIGN KEY (`entitySupervisionReference`) REFERENCES `Supervision`(`entityReference`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CEJ_ExpedientesUsuarios` ADD CONSTRAINT `CEJ_ExpedientesUsuarios_IdExpediente_fkey` FOREIGN KEY (`IdExpediente`) REFERENCES `CEJ_Expedientes`(`idExpediente`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CEJ_ExpedientesActuaciones` ADD CONSTRAINT `CEJ_ExpedientesActuaciones_idExpediente_fkey` FOREIGN KEY (`idExpediente`) REFERENCES `CEJ_Expedientes`(`idExpediente`) ON DELETE SET NULL ON UPDATE CASCADE;
