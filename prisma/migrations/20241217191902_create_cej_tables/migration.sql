-- CreateTable
CREATE TABLE `CEJ_Expedientes` (
    `idExpediente` INTEGER NOT NULL AUTO_INCREMENT,
    `expedientePJ` VARCHAR(1000) NOT NULL,
    `cuadernos` INTEGER NOT NULL DEFAULT 0,
    `actuaciones` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `juzgado` VARCHAR(1000) NULL,
    `partes` VARCHAR(1000) NULL,
    `activo` VARCHAR(1) NULL,

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

-- AddForeignKey
ALTER TABLE `CEJ_ExpedientesUsuarios` ADD CONSTRAINT `CEJ_ExpedientesUsuarios_IdExpediente_fkey` FOREIGN KEY (`IdExpediente`) REFERENCES `CEJ_Expedientes`(`idExpediente`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CEJ_ExpedientesActuaciones` ADD CONSTRAINT `CEJ_ExpedientesActuaciones_idExpediente_fkey` FOREIGN KEY (`idExpediente`) REFERENCES `CEJ_Expedientes`(`idExpediente`) ON DELETE SET NULL ON UPDATE CASCADE;
