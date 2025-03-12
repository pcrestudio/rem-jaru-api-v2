import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Browser, BrowserContext, chromium, Page } from "playwright";
import { PrismaService } from "../../core/database/prisma.service";
import { ConfigService } from "@nestjs/config";
import { GetCejDossierDto } from "../cej/dto/get-cej-dossier-dto";
import axios from "axios";
import * as path from "path";
import * as fs from "fs";
import * as https from "node:https";
import { isEmpty } from "@nestjs/common/utils/shared.utils";
import UserAgent from "user-agents";
import { Workbook } from "exceljs";
import {
  Entities,
  getPrefixByEntityReference,
  mappingModuleEN,
} from "../../common/utils/entity_reference_mapping";
import { AttributeSlugConfig } from "../../config/attribute-slug.config";
import { ModelType } from "@prisma/client";
import capitalizeFirstLetter from "../../utils/capitalize";

@Injectable()
export class ScrapingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  public async importTemplate(files: Express.Multer.File[]) {
    const workbook = new Workbook();

    try {
      if (files.length > 0) {
        const filePath = files[0].path;

        await workbook.xlsx.readFile(filePath);

        const worksheet = workbook.worksheets[0];

        const results = [];

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber < 5) return;

          const rowData: Record<string, any> = {};

          row.eachCell((cell, colNumber) => {
            const columnLetter = worksheet.getColumn(colNumber).letter;
            rowData[columnLetter] = cell.value;
          });

          results.push(rowData);
        });

        fs.unlinkSync(filePath);

        if (results.length > 0) {
          await this.prisma.$transaction(
            async (tx) => {
              for (const dossier of results) {
                const moduleName = dossier["B"];
                const submodule = await tx.submodule.findFirst({
                  where: {
                    name: moduleName,
                  },
                  include: {
                    module: true,
                  },
                });
                const model = mappingModuleEN[submodule?.module?.name];

                const project = await tx.masterOption.findFirst({
                  where: {
                    name: dossier["G"],
                  },
                });
                const responsible = await tx.user.findFirst({
                  where: {
                    displayName: dossier["J"].trim(),
                  },
                });
                const studio = await tx.masterOption.findFirst({
                  where: {
                    name: dossier["L"].trim(),
                  },
                });
                const status = await tx.masterOption.findFirst({
                  where: {
                    name: dossier["Q"].trim(),
                  },
                });

                if (model) {
                  const { result, entityReference } =
                    await this.prisma.$extended[`${model}`].create({
                      data: {
                        fileCode: dossier["A"] ?? "",
                        plaintiff: dossier["D"],
                        demanded: dossier["E"],
                        coDefendant: dossier["F"],
                        projectId: project ? project.id : 0,
                        submoduleId: submodule ? submodule.id : 0,
                        responsibleId: responsible ? responsible.id : undefined,
                        cargoStudioId: studio ? studio.id : undefined,
                        statusId: status ? status.id : undefined,
                        controversialMatter: dossier["N"],
                        amount: dossier["P"],
                      },
                    });

                  const prefix = getPrefixByEntityReference(entityReference);

                  if (result) {
                    const fileCodeValidation =
                      (model as ModelType) === ModelType.JudicialProcess
                        ? {
                            entityJudicialProcessReference: entityReference,
                          }
                        : {
                            entitySupervisionReference: entityReference,
                          };

                    const sharedData = {
                      createdBy: "",
                      modifiedBy: "",
                      modelType: model as ModelType,
                      ...fileCodeValidation,
                    };

                    const connectLegal = await this.getAttributeBySlug(
                      AttributeSlugConfig.connectLegal,
                      model,
                    );

                    if (connectLegal) {
                      await tx.sectionAttributeValue.create({
                        data: {
                          sectionAttributeId: connectLegal,
                          value: dossier["AG"] ? dossier["AG"] : "",
                          ...sharedData,
                        },
                      });
                    }

                    const startDate = await this.getAttributeBySlug(
                      AttributeSlugConfig.startDate,
                      model,
                    );

                    if (startDate) {
                      await tx.sectionAttributeValue.create({
                        data: {
                          sectionAttributeId: startDate,
                          value: dossier["I"] ? dossier["I"].toString() : "",
                          ...sharedData,
                        },
                      });
                    }

                    const resume = await this.getAttributeBySlug(
                      AttributeSlugConfig.resume,
                      model,
                    );

                    if (resume) {
                      await tx.sectionAttributeValue.create({
                        data: {
                          sectionAttributeId: resume,
                          value: dossier["W"] ? dossier["W"] : "",
                          ...sharedData,
                        },
                      });
                    }

                    const risks = await this.getAttributeBySlug(
                      AttributeSlugConfig.risks,
                      model,
                    );

                    if (risks) {
                      await tx.sectionAttributeValue.create({
                        data: {
                          sectionAttributeId: risks,
                          value: dossier["AD"] ? dossier["AD"] : "",
                          ...sharedData,
                        },
                      });
                    }

                    const lawyerEmail = await this.getAttributeBySlug(
                      AttributeSlugConfig.lawyerEmail,
                      model,
                    );

                    if (lawyerEmail) {
                      await tx.sectionAttributeValue.create({
                        data: {
                          sectionAttributeId: lawyerEmail,
                          value:
                            typeof dossier["AH"] === "object"
                              ? dossier["AH"]["text"].trim()
                              : dossier["AH"].trim(),
                          ...sharedData,
                        },
                      });
                    }

                    const principalLawyer = await this.getAttributeBySlug(
                      AttributeSlugConfig.principalLawyer,
                      model,
                    );

                    if (principalLawyer) {
                      await tx.sectionAttributeValue.create({
                        data: {
                          sectionAttributeId: principalLawyer,
                          value: dossier["AI"] ? dossier["AI"] : "",
                          ...sharedData,
                        },
                      });
                    }

                    const lastSituation = await this.getAttributeBySlug(
                      AttributeSlugConfig.lastSituation,
                      model,
                    );

                    if (lastSituation) {
                      const destructure = typeof dossier["AM"];
                      let value = "";

                      if (destructure === "object") {
                        value = dossier["AM"]["richText"]
                          .map((item: any) => item.text)
                          .join("");
                      } else {
                        value = dossier["AM"];
                      }

                      await tx.sectionAttributeValue.create({
                        data: {
                          sectionAttributeId: lastSituation,
                          value: value ?? "",
                          ...sharedData,
                        },
                      });
                    }

                    const numberCase = await this.getAttributeBySlug(
                      AttributeSlugConfig.numberCase,
                      model,
                      true,
                    );

                    if (numberCase && prefix === Entities.JPCR) {
                      const destructure = typeof dossier["S"];
                      let value = "";

                      if (destructure === "object") {
                        value = dossier["S"]["richText"]
                          .map((item: any) => item.text)
                          .join("");
                      } else {
                        value = dossier["S"];
                      }

                      await tx.globalAttributeValue.create({
                        data: {
                          globalAttributeId: numberCase,
                          value: value ?? "",
                          ...sharedData,
                        },
                      });
                    }

                    const stage = await this.getAttributeOptionValueBySlug(
                      AttributeSlugConfig.stage,
                      dossier["T"],
                      true,
                    );

                    if (stage.id !== 0 && prefix === Entities.JPCR) {
                      await tx.globalAttributeValue.create({
                        data: {
                          globalAttributeId: stage.id,
                          value: stage.value,
                          ...sharedData,
                        },
                      });
                    }

                    const wronged = await this.getAttributeBySlug(
                      AttributeSlugConfig.wronged,
                      model,
                      true,
                    );

                    if (wronged && prefix === Entities.JPCR) {
                      await tx.globalAttributeValue.create({
                        data: {
                          globalAttributeId: wronged,
                          value: dossier["V"],
                          ...sharedData,
                        },
                      });
                    }

                    const nextSituation = await this.getAttributeBySlug(
                      AttributeSlugConfig.nextSituation,
                      model,
                    );

                    if (nextSituation) {
                      const destructure = typeof dossier["AN"];
                      let value = "";

                      if (destructure === "object") {
                        value = dossier["AN"]["richText"]
                          .map((item: any) => item.text)
                          .join("");
                      } else {
                        value = dossier["AN"];
                      }

                      await tx.sectionAttributeValue.create({
                        data: {
                          sectionAttributeId: lastSituation,
                          value: value ?? "",
                          ...sharedData,
                        },
                      });
                    }

                    const sede = await this.getAttributeOptionValueBySlug(
                      AttributeSlugConfig.sede,
                      dossier["X"],
                    );

                    if (sede.id !== 0) {
                      await tx.sectionAttributeValue.create({
                        data: {
                          sectionAttributeId: sede.id,
                          value: sede.value,
                          ...sharedData,
                        },
                      });
                    }

                    const criticalProcess =
                      await this.getAttributeOptionValueBySlug(
                        AttributeSlugConfig.criticalProcess,
                        dossier["AE"],
                      );

                    if (criticalProcess.id !== 0) {
                      await tx.sectionAttributeValue.create({
                        data: {
                          sectionAttributeId: criticalProcess.id,
                          value: criticalProcess.value.toLowerCase(),
                          ...sharedData,
                        },
                      });
                    }

                    const resultProcess =
                      await this.getAttributeOptionValueBySlug(
                        AttributeSlugConfig.resultProcess,
                        dossier["AJ"],
                      );

                    if (resultProcess.id !== 0) {
                      await tx.sectionAttributeValue.create({
                        data: {
                          sectionAttributeId: resultProcess.id,
                          value: resultProcess.value,
                          ...sharedData,
                        },
                      });
                    }
                  }
                }
              }
            },
            { timeout: 30000 },
          );
        }

        return results;
      }

      return "ok";
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException({
        message: `Error while inserting the excel`,
        error: error.message,
      });
    }
  }

  public async getCejGobPage() {
    const dossiers = await this.getDossiers();

    try {
      for (const dossier of dossiers) {
        await this.main(dossier);
      }

      return "finished";
    } catch (error) {
      throw new InternalServerErrorException({
        message: `Error while get dossiers`,
        error: error.message,
      });
    }
  }

  private async resolveCatpcha(
    dossier: GetCejDossierDto,
    browserContext: BrowserContext,
    page: Page,
    currentUrl: string,
    min: number,
    max: number,
  ) {
    try {
      await this.randomWait(page, min, max);

      const captchaContainer = await page.$(".h-captcha");
      const captchaSiteKey =
        await captchaContainer.getAttribute("data-sitekey");

      const { data } = await axios.post(this.config.get("CAPTCHA_URL"), {
        key: this.config.get("CAPTCHA_KEY"),
        method: "hcaptcha",
        sitekey: captchaSiteKey,
        pageurl: currentUrl,
      });

      if (!data.startsWith("OK|")) {
        console.error("Error al resolver el captcha:", data);
        await browserContext.close();
        return;
      }

      const captchaToken = data.split("|")[1];

      console.log(captchaToken);

      return;
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message,
      });
    }
  }

  private async main(dossier: GetCejDossierDto) {
    let browser: Browser;
    const min: number = 1000;
    const max: number = 3000;
    let realCaptchaValue: string = "";
    const fileCodeSplit: string[] = dossier.expedientePJ.split("-");
    const response: object = {};

    try {
      browser = await chromium.launch({ headless: false });

      const context: BrowserContext = await browser.newContext();

      const page: Page = await context.newPage();

      const url = `${this.config.get("CEJ_URL")}/cej/forms/busquedaform.html`;
      await page.goto(url);

      const currentUrl = page.url();

      if (currentUrl.includes("perfdrive")) {
        return this.resolveCatpcha(
          dossier,
          context,
          page,
          currentUrl,
          min,
          max,
        );
      }

      await this.randomWait(page, min, max);

      const hrefValue: string = "#tabs-2";

      const linkSelector = `a[href="${hrefValue}"]`;
      const linkElement = await page.$(linkSelector);

      if (linkElement) {
        await this.randomWait(page, min, max);

        await linkElement.click();

        const captchaSelector = "#captcha_image";

        const captchaImage = await page.$(captchaSelector);

        await this.randomWait(page, min, max);

        if (captchaImage) {
          const captchaPage: Page = await context.newPage();

          await captchaPage.goto(this.config.get("CEJ_URL_CAPTCHA"));

          const currentUrl = captchaPage.url();

          if (currentUrl.includes("perfdrive")) {
            console.log("soy un bot");
          }

          await this.randomWait(page, min, max);

          realCaptchaValue = await captchaPage.$eval(
            'input[type="hidden"]',
            (input: HTMLInputElement) => input.value,
          );

          await captchaPage.close();
        }

        const captchaCode = "codigoCaptcha";

        const captchaInputSelector = `input#${captchaCode}`;

        if (realCaptchaValue !== "") {
          const fileCodeSelector = `input#cod_expediente`;

          const yearFileCodeSelector = `input#cod_anio`;
          const incidentFileCodeSelector = `input#cod_incidente`;
          const provFileCodeSelector = `input#cod_distprov`;
          const organFileCodeSelector = `input#cod_organo`;
          const specFileCodeSelector = `input#cod_especialidad`;
          const instanceFileCodeSelector = `input#cod_instancia`;

          await page.fill(fileCodeSelector, fileCodeSplit[0]);

          await this.randomWait(page, min, max);

          await page.fill(yearFileCodeSelector, fileCodeSplit[1]);

          await this.randomWait(page, min, max);

          await page.fill(incidentFileCodeSelector, fileCodeSplit[2]);

          await this.randomWait(page, min, max);

          await page.fill(provFileCodeSelector, fileCodeSplit[3]);

          await this.randomWait(page, min, max);

          await page.fill(organFileCodeSelector, fileCodeSplit[4]);

          await this.randomWait(page, min, max);

          await page.fill(specFileCodeSelector, fileCodeSplit[5]);

          await this.randomWait(page, min, max);

          await page.fill(instanceFileCodeSelector, fileCodeSplit[6]);

          await this.randomWait(page, min, max);

          await page.fill(captchaInputSelector, realCaptchaValue);

          await this.randomWait(page, min, max);

          const button = await page.$("button#consultarExpedientes");

          await this.randomWait(page, min, max);

          if (button) {
            await button.click();

            await this.randomWait(page, min, max);

            const detail = await page.$("div#divDetalles");

            // empieza los detalles del expediente
            if (detail) {
              await this.randomWait(page, min, max);

              const nroJudges = await page.$$("div.divNroJuz");

              const fileCodeSelector =
                fileCodeSplit[0] +
                "-" +
                fileCodeSplit[1] +
                "-" +
                fileCodeSplit[2] +
                "-";

              let judgeString: string = "";
              let partString: string = "";
              let searchIndex: number = 0;

              for (const judge of nroJudges) {
                await this.randomWait(page, min, max);

                const text = await judge.textContent();
                const textTrim = text
                  .split("\n")
                  .map((text) => text.trim())
                  .filter((text) => text.trim());

                if (textTrim[0].includes(fileCodeSelector)) {
                  judgeString = textTrim[1];

                  const parts = await page.$$("div.partesp");

                  for (const part of parts) {
                    const partText = await part.textContent();
                    const partTrim = partText
                      .split("\n")
                      .map((text) => text.trim())
                      .filter((text) => text.trim());

                    partString = partTrim[0];
                  }
                } else {
                  searchIndex += 1;
                }
              } // termina el bucle de div detalles

              const commands = await page.$$("#command");

              await commands[searchIndex].click();

              await this.randomWait(page, min, max);

              const sides = await page.$$(".esquina");

              const performancesLength: number = sides.length;

              const actualPerformances: boolean =
                performancesLength >= dossier.actuaciones;

              if (actualPerformances) {
                const total_performances =
                  performancesLength - dossier.actuaciones;

                const new_performances = [];

                console.log(
                  "=======================================================================",
                );

                const performances = await page.$$(
                  "div.panel-body.pnl-seg.cpnlSeguimiento",
                ); // actuaciones sacadas del CEJ

                for (const performance of performances) {
                  const acts = await performance.$("div.esquina");
                  const esquina = await acts.textContent();
                  const performance_object = {};

                  if (Number(esquina) <= total_performances) {
                    const informations = await performance.$$("div.borderinf");

                    performance_object["esquina"] = Number(esquina);

                    // extraer informacion de actuaciones
                    for (const information of informations) {
                      const getTag = await information.$("div.roptionss");
                      const getTagValue = await information.$("div.fleft");

                      const tagText: string = await getTag?.textContent();
                      const tag: string = tagText?.trim();

                      const tagValueText: string =
                        await getTagValue?.textContent();
                      const tagValue: string = tagValueText?.trim();

                      const dates: string[] = [
                        "Fecha de Resolución:",
                        "Fecha de Ingreso:",
                      ];

                      if (tag) {
                        if (dates.includes(tag)) {
                          performance_object["fecha"] = tagValue.trim();
                        }

                        if (tag === "Resolución:") {
                          performance_object["resolucion"] = tagValue
                            ?.slice(0, 79)
                            .trim();
                        }

                        if (tag === "Tipo de Notificación:") {
                          performance_object["tiponotificacion"] = tagValue
                            ?.slice(0, 249)
                            .trim();
                        }

                        if (tag === "Acto:") {
                          performance_object["acto"] = tagValue
                            ?.slice(0, 49)
                            .trim();
                        }

                        if (tag === "Fojas:") {
                          performance_object["fojas"] = tagValue
                            ?.slice(0, 49)
                            .trim();
                        }

                        if (tag === "Proveido:") {
                          performance_object["proveido"] = tagValue?.trim();
                        }

                        if (tag === "Descripción de Usuario:") {
                          performance_object["descripcion_usr"] = tagValue
                            ?.slice(0, 254)
                            .trim();
                        }

                        if (tag === "Sumilla:") {
                          performance_object["sumilla"] = tagValue
                            ?.slice(0, 999)
                            .trim();
                        }
                      }
                    }
                    // finaliza extraccion de informacion

                    const downloadButtons =
                      await performance.$$("div.dBotonDesc");

                    if (downloadButtons.length > 0) {
                      for (const button of downloadButtons) {
                        const buttonDownload = await button.$(".aDescarg");

                        if (buttonDownload) {
                          const urlDownload =
                            await buttonDownload.getAttribute("href");

                          if (urlDownload !== null || urlDownload !== "") {
                            const cookies = await context.cookies();

                            const cookieHeader = cookies
                              .map((cookie) => `${cookie.name}=${cookie.value}`)
                              .join("; ");

                            const formUrlDownload = `${this.config.get("CEJ_URL")}/cej/forms/${urlDownload}`;

                            performance_object["resolucion_archivo"] =
                              await this.downloadFileFromHref(
                                formUrlDownload,
                                dossier.expedientePJ,
                                cookieHeader,
                              );
                          }
                        }
                      }
                    }
                  }

                  await this.createCejPerformance(
                    performance_object,
                    dossier.idExpediente,
                  );

                  new_performances.push(performance_object);

                  response["Juzgado"] = judgeString;
                  response["Detalle"] = new_performances;
                  response["Partes"] = partString;
                  response["Actuaciones"] = performancesLength;
                }
              }
            } // finaliza los detalles del expediente
          }
        }

        await browser.close();

        return response;
      } else {
        await browser.close();
        throw new Error(`No se encontró un enlace con href="${hrefValue}".`);
      }
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message,
      });
    }
  }

  private async getDossiers() {
    return this.prisma.cEJ_Expedientes.findMany({
      where: {
        activo: "S",
      },
    });
  }

  private async randomWait(page: Page, min: number, max: number) {
    const waitTime: number = Math.floor(Math.random() * (max - min + 1)) + min;
    await page.waitForTimeout(waitTime);
  }

  private async downloadFileFromHref(
    urlDownload: string,
    fileCode: string,
    cookieHeader: string,
  ) {
    try {
      const agent = new UserAgent();

      const response = await axios({
        method: "get",
        url: urlDownload,
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        headers: {
          "User-Agent": agent.toString(),
          Cookie: cookieHeader,
        },
        responseType: "stream",
      });

      const contentDisposition = response.headers["content-disposition"];

      console.log(urlDownload);

      let fileName: string | null = null;

      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="?([^";]+)"?/);
        if (matches && matches[1]) {
          fileName = matches[1].trim();
          fileName = `${fileCode}_${fileName}`;
        }
      }

      if (!fileName) {
        fileName = `${fileName}_archivo_descargado`;
      }

      const pathFile = path.join(this.config.get("CEJ_PATH"), fileName);

      const escritor = fs.createWriteStream(pathFile);

      response.data.pipe(escritor);

      return fileName;
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message,
      });
    }
  }

  private async createCejPerformance(performance: object, dossierId: number) {
    console.log("-------- Iniciando guardado de actuación ---------");

    const id: string =
      performance["fecha"].trim() +
      performance["resolucion"].trim() +
      performance["sumilla"].trim().slice(0, 200);

    const lastId = id.replace(" ", "");

    const dossier = await this.prisma.cEJ_ExpedientesActuaciones.findMany({
      where: {
        idActuacion: lastId,
      },
    });

    if (isEmpty(dossier)) {
      console.log("-------- Actuación ya guardada. ---------");

      return;
    }

    const now = new Date();

    return this.prisma.cEJ_ExpedientesActuaciones.create({
      data: {
        idActuacion: lastId,
        fecha: new Date(performance["fecha"]),
        resolucion: performance["resolucion"],
        tiponotificacion: performance["tiponotificacion"],
        acto: performance["acto"],
        proveido: new Date(performance["proveido"]),
        sumilla: performance["sumilla"],
        descripcion_usr: performance["descripcion_usr"],
        fojas: performance["fojas"],
        resolucion_archivo: performance["resolucion_archivo"],
        idExpediente: dossierId,
        created_at: now,
        updated_at: now,
        idProcesoUltimo: Math.random(),
      },
    });
  }

  private async getAttributeBySlug(
    slug: string,
    model: string,
    isGlobal?: boolean,
  ) {
    const slugConversion =
      (model as ModelType) === ModelType.Supervision
        ? `${model.toLowerCase()}${capitalizeFirstLetter(slug)}`
        : slug;

    if (isGlobal) {
      const globalAttribute = await this.prisma.globalAttribute.findFirst({
        where: {
          slug: slugConversion,
        },
      });

      if (!globalAttribute) {
        return null;
      }

      return globalAttribute.globalAttributeId;
    }

    const sectionAttribute = await this.prisma.sectionAttribute.findFirst({
      where: {
        slug: slugConversion,
      },
    });

    if (!sectionAttribute) {
      return null;
    }

    return sectionAttribute.sectionAttributeId;
  }

  private async getAttributeOptionValueBySlug(
    slug: string,
    optionLabel: string,
    isGlobal?: boolean,
  ) {
    if (!optionLabel || optionLabel === "") {
      return {
        value: "",
        id: 0,
      };
    }

    if (isGlobal) {
      const globalAttribute = await this.prisma.globalAttributeOption.findFirst(
        {
          where: {
            optionLabel,
            attribute: {
              slug,
            },
          },
        },
      );

      console.log({ optionLabel, slug });

      if (!globalAttribute) {
        return {
          value: "",
          id: 0,
        };
      }

      return {
        value: globalAttribute?.optionValue,
        id: globalAttribute?.globalAttributeId,
      };
    }

    const sectionAttribute = await this.prisma.sectionAttributeOption.findFirst(
      {
        where: {
          optionLabel,
          attribute: {
            slug,
          },
        },
      },
    );

    if (!sectionAttribute) {
      return {
        value: "",
        id: 0,
      };
    }

    return {
      value: sectionAttribute?.optionValue,
      id: sectionAttribute?.attributeId,
    };
  }
}
