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

@Injectable()
export class ScrapingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

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
        const { data } = await axios.post(this.config.get("CAPTCHA_URL"), {
          key: this.config.get("CAPTCHA_KEY"),
          method: "hcaptcha",
          sitekey: currentUrl,
          pageurl: url,
        });

        console.log(data);

        return;
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

      console.log(`Archivo descargado y guardado en: ${pathFile}`);

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
}
