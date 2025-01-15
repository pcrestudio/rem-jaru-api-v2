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
    name: "Procesos Judiciales Administrativos",
    order: 1,
    slug: "judicial_process_administrative",
  },
  {
    name: "Procesos Judiciales Laborales",
    order: 2,
    slug: "judicial_process_labor_court",
  },
  {
    name: "Procesos Judiciales Civiles",
    order: 3,
    slug: "judicial_process_civil_court",
  },
  {
    name: "Procesos Judiciales Penales",
    order: 4,
    slug: "judicial_process_criminal",
  },
];

const supervisionSubmodulesSeed: CreateSubmoduleDto[] = [
  {
    name: "Supervisiones OEFA",
    order: 1,
    slug: "supervision_oefa",
  },
  {
    name: "Supervisiones SUNAFIL",
    order: 2,
    slug: "supervision_sunafil",
  },
  {
    name: "Supervisiones OSINERGMIN",
    order: 3,
    slug: "supervision_osinergmin",
  },
  {
    name: "Supervisiones ANA",
    order: 4,
    slug: "supervision_ana",
  },
];

const mastersSeed: UpsertMasterDto[] = [
  {
    name: "Estudios a cargo",
    slug: MasterOptionConfig.estudios,
  },
  {
    name: "Proyectos",
    slug: MasterOptionConfig.proyectos,
  },
  {
    name: "Materia controvertida",
    slug: MasterOptionConfig.materia,
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
    name: "Etapa inspectiva",
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
    name: "Total de to-do's y alertas",
    slug: MasterReportTabs.byTodos,
  },
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
    slug: "rem",
  },
  {
    name: "Estudio GRAU",
    slug: "grau",
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

    await prisma.submodule.createMany({
      data: supervisionSubmodulesSeed.map((submodule) => ({
        ...submodule,
        moduleId: modulesSet[1].id,
      })),
    });

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

    await prisma.$transaction(async (tx) => {
      for (const studio of angloamericanStudioSeed) {
        await tx.masterOption.create({
          data: {
            ...studio,
            masterId: mastersSet[0].id,
          },
        });
      }
    });

    await prisma.masterOption.create({
      data: {
        name: "Proyecto #1",
        slug: "proyecto-1",
        masterId: mastersSet[1].id,
      },
    });

    await prisma.masterOption.create({
      data: {
        name: "Moneda",
        slug: "moneda",
        masterId: mastersSet[2].id,
      },
    });

    await prisma.section.create({
      data: {
        label: "Datos generales",
        order: 3,
        collapsable: true,
        moduleId: modulesSet[0].id,
      },
    });

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
