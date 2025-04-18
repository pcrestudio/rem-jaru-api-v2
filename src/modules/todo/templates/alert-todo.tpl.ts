import headerTemplate from "src/common/templates/headerTemplate";
import footerTemplate from "src/common/templates/footerTemplate";
import buttonTemplate from "../../../common/templates/buttonTemplate";

const frontendUrl = process.env.FRONTEND_URL;

const alertTodoTemplate = (obj) => `${headerTemplate}
  <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
    <tbody>
      <tr>
        <td>
          <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #FFFFFF; color: #000000; width: 600px; margin: 0 auto;" width="600">
            <tbody>
              <tr>
                <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
                  <table border="0" cellpadding="10" cellspacing="0" class="paragraph_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
                    <tr>
                      <td class="pad">
                        <div style="color:#0D0D0D;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;font-size:28px;line-height:120%;text-align:center;mso-line-height-alt:33.6px;">
                          <p style="margin: 0; word-break: break-word;">
                            <span style="word-break: break-word;"> 
                              <strong>
                                <span style="word-break: break-word;">Hola ${obj.displayName},</span>
                              </strong>
                            </span>
                            <br/>
                            <span style="word-break: break-word;">Tu To-Do con el asunto: "${obj.title}", está a punto de expirar en menos de dos semanas.</span>
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <table border="0" cellpadding="0" cellspacing="0" class="image_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                    <tr>
                      <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                        <div align="center" class="alignment" style="line-height:10px">
                          <div style="max-width: 316px;">
                            <img alt="Image" height="auto" src="${frontendUrl}/divider.png" style="display: block; height: auto; border: 0; width: 100%;" title="Image" width="316"/>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <table border="0" cellpadding="10" cellspacing="0" class="text_block block-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
                    <tr>
                      <td class="pad">
                        <div style="font-family: sans-serif">
                          <div class="" style="font-size: 12px; font-family: 'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; mso-line-height-alt: 18px; color: #555555; line-height: 1.5;">
                            <p style="margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 21px;">
                              Puedes verlo en el siguiente enlace.
                              <span style="word-break: break-word; color: #a8bf6f; font-size: 14px;">
                                <strong>
                                  <br/>
                                </strong>
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </table>
                           
                  <table border="0" cellpadding="0" cellspacing="0" class="button_block block-5" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                    <tr>
                      <td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:25px;text-align:center;">
                        <div align="center" class="alignment">
                           <table
                  align="center"
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    background-color: #f8f8f8;
                    border-radius: 4px;
                    padding: 20px;
                    margin: 0 auto 20px;
                    max-width: 200px;
                  "
                >
                  <tr>
                    <td
                      style="
                        font-size: 28px;
                        font-weight: 700;
                        line-height: 1.2;
                        color: #17293c;
                        text-align: center;
                        font-family: 'Montserrat', Arial, sans-serif;
                      "
                    >
                      ${buttonTemplate({
                        label: "Ir a Jaru Software",
                        url: `${frontendUrl}/admin/todos`,
                      })}
                    </td>
                  </tr>
                </table>
                        </div>
                      </td>
                    </tr>
                  </table>
                  <div class="spacer_block block-6" style="height:40px;line-height:40px;font-size:1px;"> </div>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
${footerTemplate}
`;

export default alertTodoTemplate;
