import axios from "axios";
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

export default {
  name: "pictures",
  alias: [...mergedCommands],
  uniquecommands: ["image", "couplepp", "gif", "pin"],
  description: "All picture related commands",
  start: async (KAMI, m, { inputCMD, text, doReact, prefix }) => {
    switch (inputCMD) {
      case "ppcouple":
      case "couplepp":
        await doReact("❤️");
        try {
          const imgRes = await axios.get(
            "https://couple-pfp-api.vercel.app/api/v1/couplepfp",
            { timeout: 10000 }
          );
          await KAMI.sendMessage(
            m.from,
            { image: { url: imgRes.data.male }, caption: `_For Him..._` },
            { quoted: m },
          );
          await KAMI.sendMessage(
            m.from,
            { image: { url: imgRes.data.female }, caption: `_For Her..._` },
            { quoted: m },
          );
        } catch (e) {
          await doReact("❌");
          m.reply(`Couple PP fetch failed: ${e.message}`);
        }
        break;

      case "gig":
      case "gimage":
      case "googleimage":
      case "image":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide an image Search Term !\n\nExample: *${prefix}image cheems*`,
          );
        }
        await doReact("🎴");
        try {
          const bingUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(text)}&first=1&count=15&tsc=ImageBasicHover`;
          const { data: html } = await axios.get(bingUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
            },
            timeout: 10000,
          });

          const imgUrls = [];
          for (const match of html.matchAll(
            /&quot;murl&quot;:&quot;(https?:\/\/[^&]+)&quot;/g,
          )) {
            imgUrls.push(match[1]);
          }

          if (!imgUrls.length) {
            await doReact("❌");
            return m.reply(`No images found for: *${text}*`);
          }

          const pool = imgUrls.slice(0, 10);
          const imageUrl = pool[Math.floor(Math.random() * pool.length)];
          const resText = `\n_🎴 Image Search:_ *${text}*\n\n_🧩 Powered by_ *${botName}*\n`;
          await KAMI.sendMessage(
            m.from,
            { image: { url: imageUrl }, caption: resText },
            { quoted: m },
          );
        } catch (err) {
          console.error("[ IMAGE ] Bing search error:", err.message);
          await doReact("❌");
          await m.reply(`Image search failed: ${err.message}`);
        }
        break;
      case "gif":
      case "gifsearch":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide an Tenor gif Search Term !\n\nExample: *${prefix}gif cheems bonk*`,
          );
        }
        await doReact("🎴");
        let resGif = await axios.get(
          `https://tenor.googleapis.com/v2/search?q=${text}&key=${tenorApiKey}&client_key=my_project&limit=12&media_filter=mp4`,
        );
        let resultGif = Math.floor(Math.random() * 12);
        let gifUrl = resGif.data.results[resultGif].media_formats.mp4.url;
        await KAMI.sendMessage(
          m.from,
          {
            video: { url: gifUrl },
            gifPlayback: true,
            caption: `🎀 Gif serach result for: *${text}*\n`,
          },
          { quoted: m },
        );
        break;

      case "pin":
      case "pinterest":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide an Pinterest image Search Term !\n\nExample: *${prefix}pin cheems*`,
          );
        }
        await doReact("📍");
        try {
          const { data: pinHtml } = await axios.get(
            `https://www.bing.com/images/search?q=site:pinterest.com+${encodeURIComponent(text)}&first=1&count=20`,
            {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
              },
              timeout: 10000,
            }
          );
          const pinUrls = [...pinHtml.matchAll(/&quot;murl&quot;:&quot;(https?:\/\/[^&]+)&quot;/g)]
            .map((m) => m[1])
            .filter((u) => u.includes("pinimg.com"));
          if (!pinUrls.length) {
            await doReact("❌");
            return m.reply(`No Pinterest images found for: *${text}*`);
          }
          const pool = pinUrls.slice(0, 10);
          const imgnyee = pool[Math.floor(Math.random() * pool.length)];
          const txt = `\n_📍 Pinterest Search:_ *${text}*\n\n_🧩 Powered by_ *${botName}*\n`;
          await KAMI.sendMessage(m.from, { image: { url: imgnyee }, caption: txt }, { quoted: m });
        } catch (e) {
          await doReact("❌");
          m.reply(`Pinterest search failed: ${e.message}`);
        }

        break;

      default:
        break;
    }
  },
};
