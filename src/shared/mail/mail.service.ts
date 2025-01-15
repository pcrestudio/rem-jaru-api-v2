import { Injectable } from "@nestjs/common";
const axios = require("axios");
const qs = require("qs");

@Injectable()
export class MailService {
  protected environment = process.env.NODE_ENV || "development";
  protected defaultSender = process.env.DEFAULT_EMAIL_SENDER;
  protected m365TenantId = process.env.M365_TENANT_ID || "";
  protected m365ClientId = process.env.M365_EMAIL_CLIENT_ID || "";
  protected m365ClientSecret = process.env.M365_EMAIL_CLIENT_SECRET || "";
  protected m365LoginEndpoint = "https://login.microsoftonline.com";
  protected m365GraphEnpoint = "https://graph.microsoft.com";

  async sendEmail(
    to: string[],
    subject: string,
    body: string,
    isHtml: boolean = true,
    attachments: any[] = [],
  ): Promise<void> {
    const message = {
      subject,
      body: {
        contentType: isHtml ? "HTML" : "Text",
        content: body,
      },
      toRecipients: to.map((email) => ({
        emailAddress: { address: email, name: "" },
      })),
      attachments,
    };

    const access_token: string = await this.getAuthToken();

    try {
      await axios({
        url: `${this.m365GraphEnpoint}/v1.0/users/${this.defaultSender}/sendMail`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({ message }),
      });
    } catch (error) {
      console.log(error);
    }
  }

  async sendWithTemplate(
    template: any,
    templateData: Record<string, string>,
    to: string[],
    subject: string,
    attachments: any[] = [],
  ): Promise<void> {
    //const renderedTemplate = this.renderTemplate(templates, templateData);
    //await this.sendEmail(to, subject, renderedTemplate, true, attachments);

    const renderedTemplate = this.getTemplate(template, templateData);
    await this.sendEmail(to, subject, renderedTemplate, true, attachments);
  }

  private renderTemplate(
    template: string,
    data: Record<string, string>,
  ): string {
    return Object.keys(data).reduce(
      (result, key) => result.replace(`{{${key}}}`, data[key]),
      template,
    );
  }

  getTemplate(template: any, object: any): string {
    return template(object);
  }

  protected async getAuthToken(): Promise<any> {
    const formData = {
      grant_type: "client_credentials",
      scope: `${this.m365GraphEnpoint}/.default`,
      client_id: this.m365ClientId,
      client_secret: this.m365ClientSecret,
    };

    const tokenObject = await axios({
      url: `${this.m365LoginEndpoint}/${this.m365TenantId}/oauth2/v2.0/token`,
      method: "POST",
      data: qs.stringify(formData),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const {
      data: { access_token },
    } = tokenObject;

    return access_token;
  }

  protected encodeAttachment(attachment: {
    name: string;
    content: Buffer | string;
  }) {
    const attachmentContent =
      attachment.content instanceof Buffer
        ? attachment.content.toString("base64")
        : Buffer.from(attachment.content).toString("base64");

    return {
      "@odata.type": "#microsoft.graph.fileAttachment",
      name: attachment.name,
      contentBytes: attachmentContent,
    };
  }
}
