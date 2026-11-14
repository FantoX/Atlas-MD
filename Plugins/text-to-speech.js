import tts from "google-tts-api";

let mergedCommands = [
  "say", "speak", "tts",
  "saybengali", "saybangla",
  "sayhindi",
  "sayja", "sayjapanese",
  "saykorean",
  "saychinese",
  "sayindo", "sayindonesian",
];

export default {
  name: "texttospeech",
  alias: [...mergedCommands],
  uniquecommands: ["say", "saybengali", "sayhindi", "sayjapanese", "saykorean", "saychinese", "sayindo"],
  description: "All Text to Speech Commands",
  start: async (
    KAMI,
    m,
    { inputCMD, text, prefix, doReact, args, isMedia, quoted }
  ) => {
    if (!text && !m.quoted) {
      await doReact("❔");
      return m.reply(`Please provide a text (Type or mention a message) !\n\nExample: ${prefix}say KAMI MD is OP`);
    }
    if (isMedia) {
      await doReact("❌");
      return m.reply(`Please provide a text (Type or mention a message) !\n\nExample: ${prefix}say KAMI MD is OP`);
    }

    const sayMess = m.quoted ? m.quoted.msg : args[0] ? args.join(" ") : "No text found";

    const sendTTS = async (lang) => {
      await doReact("🪄");
      await KAMI.sendPresenceUpdate("recording", m.from);
      try {
        const urls = tts.getAllAudioUrls(sayMess, {
          lang,
          slow: false,
          host: "https://translate.google.com",
          splitPunct: ",.?",
        });
        await KAMI.sendMessage(
          m.from,
          { audio: { url: urls[0].url }, mimetype: "audio/mpeg" },
          { quoted: m }
        );
      } catch (e) {
        m.reply(`An error occurred!: ${e.message}`);
      }
    };

    switch (inputCMD) {
      case "say":
      case "speak":
      case "tts":
        await sendTTS("en");
        break;

      case "saybengali":
      case "saybangla":
        await sendTTS("bn");
        break;

      case "sayhindi":
        await sendTTS("hi");
        break;

      case "sayja":
      case "sayjapanese":
        await sendTTS("ja");
        break;

      case "saykorean":
        await sendTTS("ko");
        break;

      case "saychinese":
        await sendTTS("zh-TW");
        break;

      case "sayindo":
      case "sayindonesian":
        await sendTTS("id");
        break;

      default:
        break;
    }
  },
};
