const buttonTemplate = ({ label, url }) => `<!--[if mso]>
          <!--[if !vml]><!-->
        <![endif]-->

        <!--[if mso]>
        <v:roundrect
          xmlns:v="urn:schemas-microsoft-com:vml"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          href="${url}"
          style="
            height: 62px;
            v-text-anchor: middle;
            width: 266px;
          "
          arcsize="7%"
          stroke="false"
          fillcolor="#1aa8de"
        >
          <w:anchorlock />
          <v:textbox inset="0px,0px,0px,0px">
            <center
              style="
                color: #ffffff !important;
                font-family: 'Trebuchet MS', Tahoma, sans-serif;
                font-size: 16px;
              "
            >
        <![endif]-->

        <!-- For non-Outlook clients, wrap entire button in <a> -->
        <a
          href="${url}"
          target="_blank"
          style="
            background-color: #1aa8de;
            border-radius: 4px;
            color: #ffffff !important;
            display: inline-block;
            font-family: 'Montserrat', 'Trebuchet MS',
                         'Lucida Grande', 'Lucida Sans Unicode',
                         'Lucida Sans', Tahoma, sans-serif;
            font-size: 16px;
            text-decoration: none;
            text-align: center;
            padding: 15px 20px; 
            mso-padding-alt: 0;
          "
        >
          ${label}
        </a>

        <!--[if mso]>
            </center>
          </v:textbox>
        </v:roundrect>
        <![endif]-->`;
export default buttonTemplate;
