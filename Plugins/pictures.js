const gis = require("g-i-s");
const axios = require("axios");
const hxzapi = require("hxz-api");
let mergedCommands = [
  "gig",
  "gimage",
  "googleimage",
  "image",
  "ppcouple",
  "couplepp",
  "gifsearch",
  "gif",
  "pin",
  "pinterest",
];

module.exports = {
  name: "pictures",
  alias: [...mergedCommands],
  uniquecommands:[
    "image",
    "couplepp",
    "gif",
    "pin",
  ],
  description: "All picture related commands",
  start: async (Atlas, m, { inputCMD, text, doReact, prefix}) => {
    switch (inputCMD) {
      case "ppcouple":
      case "couplepp":
       await doReact("❤️");
        let imgRes = await axios.get("https://zany-teal-alligator-suit.cyclic.app/couple");
        Atlas.sendMessage(
          m.from,
          { image: { url: imgRes.data.male }, caption: `_For Him..._` },
          { quoted: m }
        );
        Atlas.sendMessage(
          m.from,
          { image: { url: imgRes.data.female }, caption: `_For Her..._` },
          { quoted: m }
        );
        break;

      case "gig":
      case "gimage":
      case "googleimage":
      case "image":
        if (!text) {
          await doReact("❔");
          return m.reply(`Please provide an image Search Term !\n\nExample: *${prefix}image cheems*`);
        }
        await doReact("🎴");
        gis(text, async (error, result) => {
          n = result;
          let images = n[Math.floor(Math.random() * n.length)].url;
          let resText = `\n_🎀 Image Search Term:_ *${text}*\n\n_🧩 Powered by_ *${botName}*\n`;
          /*
          let buttons = [
            {
                buttonId: `${prefix}gimage ${text}`,
                buttonText: { displayText: ">>" },
                type: 1,
            },
          ];
          */
          await Atlas.sendMessage(
            m.from,
            {
              image: { url: images },
              caption: resText,
              //footer: `*${botName}*`,
              //buttons: buttons,
              //headerType: 4,
            },
            { quoted: m }
          );
        });
        break;
      case "gif":
      case "gifsearch":
        if (!text) {
          await doReact("❔")
            return m.reply(`Please provide an Tenor gif Search Term !\n\nExample: *${prefix}gif cheems bonk*`);
        }
        await doReact("🎴");
        let resGif = await axios.get(
          `https://tenor.googleapis.com/v2/search?q=${text}&key=${tenorApiKey}&client_key=my_project&limit=12&media_filter=mp4`
        );
        let resultGif = Math.floor(Math.random() * 12);
        let gifUrl = resGif.data.results[resultGif].media_formats.mp4.url;
        await Atlas.sendMessage(
          m.from,
          {
            video: { url: gifUrl },
            gifPlayback: true,
            caption: `🎀 Gif serach result for: *${text}*\n`,
          },
          { quoted: m }
        );
        break;

      case "pin":
      case "pinterest":
        if (!text) {
          await doReact("❔")
            return m.reply(`Please provide an Pinterest image Search Term !\n\nExample: *${prefix}pin cheems*`);
          
        }
        await doReact("📍");
        hxzapi
          .pinterest(text)
          .then(async (res) => {
            imgnyee = res[Math.floor(Math.random() * res.length)];
            /*let buttons = [
          {
            buttonId: `${prefix}pinterest ${args.join(" ")}`,
            buttonText: { displayText: ">>" },
            type: 1,
          },
        ];*/
            let txt = `\n_🎀 Pinterest Search Term:_ *${text}*\n\n_🧩 Powered by_ *${botName}*\n`;
            let buttonMessage = {
              image: { url: imgnyee },
              caption: txt,
              //footer: `*${botName}*`,
              //buttons: buttons,
              //headerType: 4,
            };
            Atlas.sendMessage(m.from, buttonMessage, { quoted: m });
          })
          .catch((_) => _);

        break;

      default:
        break;
    }
  },
};
