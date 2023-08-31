const axios = require("axios");
const { getBuffer } = require("../System/Function2.js");
let mergedCommands = ["toqr"];

module.exports = {
  name: "otherscommands",
  alias: [...mergedCommands],
  uniquecommands: ["toqr"],
  description: "Other commands",
  start: async (
    Atlas,
    m,
    { pushName, prefix, inputCMD, doReact, text, args, participants, isCreator }
  ) => {
    switch (inputCMD) {
      case "toqr":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide an URL to convert into QR code!\n\nExample: *${prefix}toqr https://github.com/FantoX001*`
          );
        }

        const res = await getBuffer(
          `https://www.qrtag.net/api/qr_8.png?url=${text}`
        );
        return Atlas.sendMessage(
          m.from,
          { image: res, caption: `\n*Source:* ${text}` },
          { quoted: m }
        );

      default:
        break;
    }
  },
};
