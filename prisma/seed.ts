import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { CreateModuleDto } from "../src/modules/module/dto/create-module.dto";
import { CreateSubmoduleDto } from "../src/modules/module/dto/create-submodule.dto";
import { UpsertMasterDto } from "../src/modules/master/dto/create-master.dto";
import { UpsertInstanceDto } from "../src/modules/instance/dto/upsert-instance.dto";
import { CreateMasterOptionDto } from "../src/modules/master/dto/create-master-option.dto";
import { MasterTodosStates } from "../src/config/master-todos-states.config";
import { MasterReportTabs } from "../src/config/master-report-tabs.config";
import { UpsertRoleDto } from "../src/modules/roles/dto/create-role.dto";
import { AuthMethod } from "../src/config/auth-method.config";
import { MasterOptionConfig } from "../src/config/master-option.config";
import { mappingSubmodules } from "../src/common/utils/mapping_submodules";
import { MasterSituationConfig } from "../src/config/master-situation.config";
import { MasterStatusConfig } from "../src/config/master-status.config";

const prisma = new PrismaClient();

const modulesSeed: CreateModuleDto[] = [
  {
    name: "Procesos Judiciales",
    order: 1,
    slug: "procesos-judiciales",
  },
  {
    name: "Supervisiones",
    order: 2,
    slug: "supervisiones",
  },
];

const subModulesSeed: CreateSubmoduleDto[] = [
  {
    name: "Administrativos",
    order: 1,
    slug: "judicial_process_administrative",
  },
  {
    name: "Laborales",
    order: 2,
    slug: "judicial_process_labor_court",
  },
  {
    name: "Civiles",
    order: 3,
    slug: "judicial_process_civil_court",
  },
  {
    name: "Penales",
    order: 4,
    slug: "judicial_process_criminal",
  },
];

const supervisionSubmodulesSeed: CreateSubmoduleDto[] = [
  {
    name: "OEFA",
    order: 1,
    slug: "supervision_oefa",
  },
  {
    name: "SUNAFIL",
    order: 2,
    slug: "supervision_sunafil",
  },
  {
    name: "OSINERGMIN",
    order: 3,
    slug: "supervision_osinergmin",
  },
  {
    name: "ANA",
    order: 4,
    slug: "supervision_ana",
  },
];

const situationOefaSupervisionSeed: CreateMasterOptionDto[] = [
  {
    name: "Dirección de Supervisión",
    slug: "dir-supervision",
  },
  {
    name: "Dirección de Fiscalización",
    slug: "dir-fiscalizacion",
  },
  {
    name: "Tribunal de Fiscalización Ambiental",
    slug: "trib-fiscal-ambiental",
  },
];

const situationSunafilSupervisionSeed: CreateMasterOptionDto[] = [
  {
    name: "Intendencia de Lima Metropolitana",
    slug: "int-lima-metro",
  },
  {
    name: "Intendencia Regional",
    slug: "int-regional",
  },
  {
    name: "Tribunal de Fiscalizacion Laboral",
    slug: "trib-fiscal-laboral",
  },
];

const situationOsinergminSupervisionSeed: CreateMasterOptionDto[] = [
  {
    name: "Gerencia de Supervisión",
    slug: "int-lima-metro",
  },
  {
    name: "Gerencia de Fiscalización",
    slug: "int-regional",
  },
  {
    name: "TASTEM",
    slug: "trib-fiscal-laboral",
  },
];

const situationAnaSupervisionSeed: CreateMasterOptionDto[] = [
  {
    name: "Autoridad Local del Agua",
    slug: "aut-agua",
  },
  {
    name: "Autoridad Administrativa del Agua",
    slug: "aut-adm-agua",
  },
  {
    name: "Tribunal Nacional de Resolución de Controversias Hídricas",
    slug: "trib-nac-hidricas",
  },
];

const mastersSeed: UpsertMasterDto[] = [
  {
    name: "Proyectos",
    slug: MasterOptionConfig.proyectos,
  },
  {
    name: "Moneda",
    slug: MasterOptionConfig.moneda,
  },
];

const judicialProcessInstancesSeed: UpsertInstanceDto[] = [
  {
    name: "Primera instancia",
    isGlobal: true,
  },
  {
    name: "Segunda instancia",
    isGlobal: true,
  },
  {
    name: "Casación",
    isGlobal: true,
  },
];

const supervisionInstancesSeed: UpsertInstanceDto[] = [
  {
    name: "Etapa preliminar",
    isGlobal: true,
  },
  {
    name: "Etapa de supervisión",
    isGlobal: true,
  },
  {
    name: "Etapa sancionadora",
    isGlobal: true,
  },
];

const todoEstadosSeed: CreateMasterOptionDto[] = [
  {
    name: "Caduca en más de dos semanas",
    slug: MasterTodosStates.moreThanTwoWeeks,
  },
  {
    name: "Caduca en menos de dos semanas",
    slug: MasterTodosStates.lessThanTwoWeeks,
  },
  {
    name: "Caducó",
    slug: MasterTodosStates.expired,
  },
];

const reportTabsSeed: CreateMasterOptionDto[] = [
  {
    name: "Por responsables",
    slug: MasterReportTabs.byResponsible,
  },
  {
    name: "Por demandante",
    slug: MasterReportTabs.byDemanded,
  },
  {
    name: "Por demandado",
    slug: MasterReportTabs.byPlaintiff,
  },
  {
    name: "Por estudio a cargo",
    slug: MasterReportTabs.byStudio,
  },
  {
    name: "Total de to-do's y alertas",
    slug: MasterReportTabs.byTodos,
  },
];

const situationSeed: CreateMasterOptionDto[] = [
  {
    name: "En proceso",
    slug: MasterSituationConfig.en_proceso,
  },
  {
    name: "Vigente",
    slug: MasterSituationConfig.vigente,
  },
  {
    name: "Vencido",
    slug: MasterSituationConfig.vencido,
  },
];

const statusSeed: CreateMasterOptionDto[] = [
  {
    name: "Concluido",
    slug: MasterStatusConfig.concluido,
  },
  {
    name: "Activo",
    slug: MasterStatusConfig.activo,
  },
];

const generalProjectsSeed: CreateMasterOptionDto[] = [
  {
    name: "Proyecto #1",
    slug: "proyecto-general-1",
  },
  {
    name: "Proyecto #2",
    slug: "proyecto-general-2",
  },
  {
    name: "Proyecto #3",
    slug: "proyecto-general-3",
  },
];

const rolesSeed: UpsertRoleDto[] = [
  {
    title: "Súper administrador",
    name: "super-admin",
    description:
      "El súper administrador tiene acceso total a todo tipo de acciones y módulos que existan en la plataforma.",
  },
  {
    title: "Administrador",
    name: "admin",
    description:
      "El administrador tiene acceso limitado a módulos que existan en la plataforma.",
  },
  {
    title: "Supervisor",
    name: "visualizer",
    description:
      "El Supervisor puede ver todos los módulos, To Do y reportes. También puede crear To Dos.",
  },
  {
    title: "Ejecutor",
    name: "executor",
    description:
      "El Ejecutor puede ver y editar los To Dos asignados a su usuario.",
  },
];

const judicialInstanceStepOneSeed: UpsertInstanceDto[] = [
  {
    name: "Demanda",
    isGlobal: true,
  },
  {
    name: "Contestación de demanda",
    isGlobal: true,
  },
  {
    name: "Oposiciones a los medios probatorios",
    isGlobal: true,
  },
  {
    name: "Solicitud de excepciones",
    isGlobal: true,
  },
  {
    name: "Absolución de contestación",
    isGlobal: true,
  },
  {
    name: "Solicitud de improcedencia",
    isGlobal: true,
  },
  {
    name: "Informe de saneamiento",
    isGlobal: true,
  },
  {
    name: "Informe oral",
    isGlobal: true,
  },
  {
    name: "Sentencia",
    isGlobal: true,
  },
];

const judicialInstanceStepTwoSeed: UpsertInstanceDto[] = [
  {
    name: "Apelación",
    isGlobal: true,
  },
  {
    name: "Absolución de traslado de apelación",
    isGlobal: true,
  },
  {
    name: "Programación de vista de la causa",
    isGlobal: true,
  },
  {
    name: "Solicitud de uso de palabra",
    isGlobal: true,
  },
  {
    name: "Sentencia de la vista",
    isGlobal: true,
  },
];

const judicialInstanceStepThreeSeed: UpsertInstanceDto[] = [
  {
    name: "Solicitud de casación",
    isGlobal: true,
  },
  {
    name: "Solicitud de improcedencia",
    isGlobal: true,
  },
  {
    name: "Auto de procedencia",
    isGlobal: true,
  },
  {
    name: "Programación de vista de la causa",
    isGlobal: true,
  },
  {
    name: "Solicitud de uso de palabra",
    isGlobal: true,
  },
  {
    name: "Sentencia de fondo",
    isGlobal: true,
  },
];

const angloamericanStudioSeed: CreateMasterOptionDto[] = [
  {
    name: "Estudio Rodrigo, Elías & Medrano",
    slug: "rem",
  },
  {
    name: "Estudio PAYET",
    slug: "payet",
  },
  {
    name: "Estudio CUATRECASAS",
    slug: "cuatrecasas",
  },
  {
    name: "Estudio GRAU",
    slug: "grau",
  },
];

const contingenciesSeed: CreateMasterOptionDto[] = [
  {
    name: "Probable",
    slug: "probable",
  },
  {
    name: "Posible",
    slug: "posible",
  },
  {
    name: "Remoto",
    slug: "remoto",
  },
];

async function main() {
  const password = await hash("admin", 9);

  const user_one = await prisma.user.create({
    data: {
      firstName: "Jaru",
      lastName: "Admin",
      displayName: "Jaru Admin",
      authMethod: AuthMethod.local,
      email: "piero.cusi@estudiorodrigo.com",
      password,
    },
  });

  const rolesSet = [];

  await prisma.$transaction(async (tx) => {
    for (const role of rolesSeed) {
      const roles_created = await tx.role.create({
        data: {
          ...role,
        },
      });

      rolesSet.push(roles_created);
    }
  });

  const assign_role = await prisma.userRole.createMany({
    data: [user_one].map((user) => ({
      userId: user.id,
      roleId: rolesSet[0].id,
    })),
  });

  if (assign_role) {
    const modulesSet = [];
    const mastersSet = [];
    const instanceSet = [];
    const instanceSupervisionSet = [];
    const supervisionSet = [];
    const masterAuthority = [];

    await prisma.$transaction(async (tx) => {
      for (const module of modulesSeed) {
        const module_created = await tx.module.create({
          data: {
            ...module,
          },
        });

        modulesSet.push(module_created);
      }
    });

    await prisma.submodule.createMany({
      data: subModulesSeed.map((submodule) => ({
        ...submodule,
        moduleId: modulesSet[0].id,
      })),
    });

    // Empieza configuración de supervisiones
    await prisma.$transaction(async (tx) => {
      for (const submodule of supervisionSubmodulesSeed) {
        const supervision_created = await tx.submodule.create({
          data: {
            ...submodule,
            moduleId: modulesSet[1].id,
          },
        });

        supervisionSet.push(supervision_created);
      }
    });
    // Finaliza configuración de supervisiones

    await prisma.$transaction(async (tx) => {
      for (const master of mastersSeed) {
        const master_created = await tx.master.create({
          data: {
            ...master,
            moduleId: modulesSet[0].id,
          },
        });

        mastersSet.push(master_created);
      }
    });

    const masterTodoEstados = await prisma.master.create({
      data: {
        name: "Estados",
        slug: "todo-estados",
      },
    });

    await prisma.$transaction(async (tx) => {
      for (const masterOption of todoEstadosSeed) {
        await tx.masterOption.create({
          data: {
            name: masterOption.name,
            slug: masterOption.slug,
            masterId: masterTodoEstados.id,
          },
        });
      }
    });

    // Empieza creacion de proyectos generales
    const generalProjects = await prisma.master.create({
      data: {
        name: "Proyectos",
        slug: MasterOptionConfig.proyectosGeneral,
      },
    });

    await prisma.$transaction(async (tx) => {
      for (const masterOption of generalProjectsSeed) {
        await tx.masterOption.create({
          data: {
            name: masterOption.name,
            slug: masterOption.slug,
            masterId: generalProjects.id,
          },
        });
      }
    });
    // Finaliza creacion de opciones de proyectos generales

    const masterTabs = await prisma.master.create({
      data: {
        name: "Tabs para reportes global",
        slug: MasterOptionConfig.tabs,
      },
    });

    await prisma.$transaction(async (tx) => {
      for (const masterOption of reportTabsSeed) {
        await tx.masterOption.create({
          data: {
            name: masterOption.name,
            slug: masterOption.slug,
            masterId: masterTabs.id,
          },
        });
      }
    });

    // Empieza la creación de maestro estudios de manera general
    const studioMaster = await prisma.master.create({
      data: {
        name: "Estudios",
        slug: MasterOptionConfig.estudios,
      },
    });

    await prisma.$transaction(async (tx) => {
      for (const studio of angloamericanStudioSeed) {
        await tx.masterOption.create({
          data: {
            ...studio,
            masterId: studioMaster.id,
          },
        });
      }
    });

    // Empieza la creación de maestro estudios de manera general
    const contingencyMaster = await prisma.master.create({
      data: {
        name: "Nivel de contingencia",
        slug: MasterOptionConfig["nivel-contingencia"],
      },
    });

    await prisma.$transaction(async (tx) => {
      for (const studio of contingenciesSeed) {
        await tx.masterOption.create({
          data: {
            ...studio,
            masterId: contingencyMaster.id,
          },
        });
      }
    });

    // Empieza la creación de maestro situación
    const situationMaster = await prisma.master.create({
      data: {
        name: "Situación",
        slug: MasterOptionConfig.situacion,
      },
    });

    await prisma.$transaction(async (tx) => {
      for (const masterOption of situationSeed) {
        await tx.masterOption.create({
          data: {
            name: masterOption.name,
            slug: masterOption.slug,
            masterId: situationMaster.id,
          },
        });
      }
    });

    // finaliza la creación de maestro de situación

    // Empieza la creación de maestro status
    const statusMaster = await prisma.master.create({
      data: {
        name: "Status",
        slug: MasterOptionConfig.status,
      },
    });

    await prisma.$transaction(async (tx) => {
      for (const masterOption of statusSeed) {
        await tx.masterOption.create({
          data: {
            name: masterOption.name,
            slug: masterOption.slug,
            masterId: statusMaster.id,
          },
        });
      }
    });

    // finaliza la creación de maestro de status

    await prisma.masterOption.create({
      data: {
        name: "Proyecto #1",
        slug: "proyecto-1",
        masterId: mastersSet[0].id,
      },
    });

    await prisma.masterOption.create({
      data: {
        name: "Soles",
        slug: "soles",
        masterId: mastersSet[1].id,
      },
    });

    await prisma.masterOption.create({
      data: {
        name: "Dólares",
        slug: "dolares",
        masterId: mastersSet[1].id,
      },
    });

    // Procesos judiciales secciones para atributos extendidos
    await prisma.section.create({
      data: {
        label: "Última actuación",
        order: 1,
        collapsable: true,
        moduleId: modulesSet[0].id,
      },
    });

    await prisma.section.create({
      data: {
        label: "Datos generales",
        order: 2,
        collapsable: true,
        moduleId: modulesSet[0].id,
      },
    });
    // Finaliza procesos judiciales secciones de atributos extendidos

    // Supervisiones secciones para atributos extendidos
    await prisma.section.create({
      data: {
        label: "Última actuación",
        order: 1,
        collapsable: true,
        moduleId: modulesSet[1].id,
      },
    });

    await prisma.section.create({
      data: {
        label: "Datos generales",
        order: 2,
        collapsable: true,
        moduleId: modulesSet[1].id,
      },
    });
    // Finaliza supervisiones secciones de atributos extendidos

    // Instancias de procesos judiciales
    await prisma.$transaction(async (tx) => {
      for (const instance of judicialProcessInstancesSeed) {
        const instance_created = await tx.instance.create({
          data: {
            ...instance,
            moduleId: modulesSet[0].id,
          },
        });

        instanceSet.push(instance_created);
      }
    });

    //Empieza creación de pasos en procesos judiciales
    await prisma.$transaction(async (tx) => {
      for (const step of judicialInstanceStepOneSeed) {
        await tx.step.create({
          data: {
            ...step,
            instanceId: instanceSet[0].id,
          },
        });
      }
    });

    await prisma.$transaction(async (tx) => {
      for (const step of judicialInstanceStepTwoSeed) {
        await tx.step.create({
          data: {
            ...step,
            instanceId: instanceSet[1].id,
          },
        });
      }
    });

    await prisma.$transaction(async (tx) => {
      for (const step of judicialInstanceStepThreeSeed) {
        await tx.step.create({
          data: {
            ...step,
            instanceId: instanceSet[2].id,
          },
        });
      }
    });
    // Finaliza creacion de pasos en procesos judiciales

    // Empieza la creacion de maestros autoridad en cada uno de los submodulos, más sus opciones
    await prisma.$transaction(async (tx) => {
      for (const submodule of supervisionSet) {
        const master_authority_created = await tx.master.create({
          data: {
            name: "Autoridad",
            slug: `autoridad-${mappingSubmodules[submodule.slug]}`,
            submoduleId: submodule.id,
          },
        });

        masterAuthority.push(master_authority_created);
      }
    });

    // OEFA
    await prisma.$transaction(async (tx) => {
      for (const masterOption of situationOefaSupervisionSeed) {
        await tx.masterOption.create({
          data: {
            ...masterOption,
            masterId: masterAuthority[0].id,
          },
        });
      }
    });

    // SUNAFIL
    await prisma.$transaction(async (tx) => {
      for (const masterOption of situationSunafilSupervisionSeed) {
        await tx.masterOption.create({
          data: {
            ...masterOption,
            masterId: masterAuthority[1].id,
          },
        });
      }
    });

    // OSINERGMIN
    await prisma.$transaction(async (tx) => {
      for (const masterOption of situationOsinergminSupervisionSeed) {
        await tx.masterOption.create({
          data: {
            ...masterOption,
            masterId: masterAuthority[2].id,
          },
        });
      }
    });

    // ANA
    await prisma.$transaction(async (tx) => {
      for (const masterOption of situationAnaSupervisionSeed) {
        await tx.masterOption.create({
          data: {
            ...masterOption,
            masterId: masterAuthority[3].id,
          },
        });
      }
    });

    // Finaliza la creacióm

    // Instancias de supervisiones
    await prisma.$transaction(async (tx) => {
      for (const instance of supervisionInstancesSeed) {
        const instance_created = await tx.instance.create({
          data: {
            ...instance,
            moduleId: modulesSet[1].id,
          },
        });

        instanceSupervisionSet.push(instance_created);
      }
    });
    // Finaliza creación de instancias
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
