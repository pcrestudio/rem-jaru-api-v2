import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { CreateModuleDto } from "../src/modules/module/dto/create-module.dto";
import { CreateSubmoduleDto } from "../src/modules/module/dto/create-submodule.dto";
import { UpsertMasterDto } from "../src/modules/master/dto/create-master.dto";
import { UpsertInstanceDto } from "../src/modules/instance/dto/upsert-instance.dto";
import { CreateMasterOptionDto } from "../src/modules/master/dto/create-master-option.dto";
import { MasterTodosStates } from "../src/config/master-todos-states.config";
import { MasterReportTabs } from "../src/config/master-report-tabs.config";

const prisma = new PrismaClient();

export enum MasterOptionConfig {
  materia = "materia-controvertida",
  estudios = "estudios-a-cargo",
  proyectos = "proyectos",
}

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

async function main() {
  const password = await hash("admin", 9);

  const user_one = await prisma.user.create({
    data: {
      firstName: "Piero",
      lastName: "Cusi",
      email: "piero.cusi@jaru.pe",
      password,
    },
  });

  const user_two = await prisma.user.create({
    data: {
      firstName: "Jaru",
      lastName: "Súper admin",
      email: "super.admin@jaru.pe",
      password,
    },
  });

  const role_super_admin = await prisma.role.create({
    data: {
      title: "Súper administrador",
      name: "super-admin",
      description:
        "El súper administrador tiene acceso total a todo tipo de acciones y módulos que existan en la plataforma.",
    },
  });

  const assign_role = await prisma.userRole.createMany({
    data: [user_one, user_two].map((user) => ({
      userId: user.id,
      roleId: role_super_admin.id,
    })),
  });

  if (assign_role) {
    const modulesSet = [];
    const mastersSet = [];

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

    const masterTabs = await prisma.master.create({
      data: {
        name: "Tabs para reportes global",
        slug: "reportes-tabs",
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

    await prisma.masterOption.create({
      data: {
        name: "Estudio Rodrigo, Elías & Medrano",
        slug: "rem",
        masterId: mastersSet[0].id,
      },
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
        label: "Control de contingencia",
        order: 1,
        collapsable: true,
        moduleId: modulesSet[0].id,
      },
    });

    await prisma.section.create({
      data: {
        label: "Situación actual",
        order: 2,
        collapsable: true,
        moduleId: modulesSet[0].id,
      },
    });

    await prisma.$transaction(async (tx) => {
      for (const instance of judicialProcessInstancesSeed) {
        const instance_created = await tx.instance.create({
          data: {
            ...instance,
            moduleId: modulesSet[0].id,
          },
        });

        mastersSet.push(instance_created);
      }
    });

    await prisma.$transaction(async (tx) => {
      for (const instance of supervisionInstancesSeed) {
        const instance_created = await tx.instance.create({
          data: {
            ...instance,
            moduleId: modulesSet[1].id,
          },
        });

        mastersSet.push(instance_created);
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
