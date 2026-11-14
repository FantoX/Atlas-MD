import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { getBuffer } from "../System/Function2.js";
import url from "url";
import { checkMod } from "../System/MongoDB/MongoDb_Core.js";
import https from "https";
import pm2 from "pm2";
import { fork } from "child_process";

let mergedCommands = [
  "hd",
  "upscale",
  "upscalehd",
  "calc",
  "calculate",
  "exec",
  "run",
  "html",
  "gethtml",
  "shorturl",
  "short",
  "tinyurl",
];

export default {
  name: "tools",
  alias: [...mergedCommands],
  uniquecommands: ["upscale", "calc", "calculate", "exec", "gethtml"],
  description: "Various handy tool commands",

  start: async (
    KAMI,
    m,
    { inputCMD, text, quoted, mime, doReact, prefix, isCreator, isintegrated },
  ) => {
    switch (inputCMD) {
      case "hd":
      case "upscale":
      case "upscalehd":
        try {
          let target = quoted ? quoted : m;
          let mimeType = quoted?.mimetype || mime || "";

          if (!/image/.test(mimeType)) {
            if (doReact) await doReact("❔");
            return m.reply(`Reply to an *image* with ${prefix}hd`);
          }

          if (doReact) await doReact("⏳");
          const imgBuffer = await KAMI.downloadMediaMessage(target);

          const form = new FormData();
          const isWebp = mimeType.includes("webp");
          form.append("image", imgBuffer, {
            filename: isWebp ? "image.webp" : "image.jpg",
            contentType: isWebp ? "image/webp" : "image/jpeg",
          });
          form.append("scale", "2");

          const res = await axios.post(
            "https://api2.pixelcut.app/image/upscale/v1",
            form,
            {
              headers: {
                ...form.getHeaders(),
                accept: "application/json",
                "x-client-version": "web",
                "x-locale": "en",
              },
            },
          );

          if (!res.data?.result_url) {
            throw new Error("Upscale API failed");
          }

          const buffer = await getBuffer(res.data.result_url);

          await KAMI.sendMessage(
            m.from,
            {
              image: buffer,
              caption:
                "✨ *KAMI-MD HD Upscale*\n\nImage enhanced successfully.",
            },
            { quoted: m },
          );

          if (doReact) await doReact("✅");
        } catch (e) {
          console.log("[ UPSCALE ERROR ]", e?.response?.data || e.message);

          if (doReact) await doReact("❌");
          m.reply("Upscale failed. Try another image.");
        }
        break;

      case "calc":
      case "calculate":
        if (!text) {
          if (doReact) await doReact("❔");
          return KAMI.sendMessage(
            m.from,
            { text: `Example: ${prefix}calc 2+2` },
            { quoted: m },
          );
        }

        try {
          const result = eval(text);

          if (doReact) await doReact("🧮");
          await KAMI.sendMessage(
            m.from,
            { text: `🧮 Result\n\n${text} = ${result}` },
            { quoted: m },
          );
        } catch {
          if (doReact) await doReact("❌");
          await KAMI.sendMessage(
            m.from,
            { text: "❌ Invalid expression" },
            { quoted: m },
          );
        }
        break;

      case "exec":
      case "run":
        const isUsermod = await checkMod(m.sender);
        if (!isCreator && !isintegrated && !isUsermod) {
          if (doReact) await doReact("❌");
          return m.reply(
            "Sorry, only my *Mods* can use *Realtime Script Execution*.",
          );
        }
        if (!text) {
          if (doReact) await doReact("❔");
          return m.reply(
            `Please provide a command to execute!\n\nExample: *${prefix}exec m.reply("3rd party code is being executed...")*`,
          );
        }
        if (doReact) await doReact("🔰");
        try {
          const result = eval(text);
          const out =
            JSON.stringify(result, null, "\t") || "Evaluated JavaScript";
        } catch (e) {
          m.reply(`Error: ${e.message}`);
        }
        break;

      case "html":
      case "gethtml":
        if (!text) {
          if (doReact) await doReact("❔");
          return m.reply(
            `Please provide an website to get HTML!\n\nExample: *${prefix}html target_website*`,
          );
        }

        if (doReact) await doReact("🔰");
        try {
          let target = text;
          if (text.split(" ")[0] != "--txt") {
            if (!text.includes("http") && !text.includes("https")) {
              target = "http://" + text;
            }
            const parsedUrl = url.parse(target);
            const hostname = parsedUrl.hostname;
            const path = parsedUrl.pathname;
            const options = {
              hostname: hostname,
              path: path,
              method: "GET",
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
                Connection: "keep-alive",
                "Accept-Language": "en-US,en;q=0.9",
                Accept:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              },
            };
            const req = https.request(options, (res) => {
              let data = "";

              res.on("data", (chunk) => {
                data += chunk;
              });

              res.on("end", () => {
                fs.writeFile(`./System/Cache/${hostname}.html`, data, (err) => {
                  if (err) {
                    m.reply("Error: " + err.message);
                  } else {
                    const mainfile = fs.readFileSync(
                      `./System/Cache/${hostname}.html`,
                    );
                    KAMI.sendMessage(
                      m.from,
                      {
                        document: mainfile,
                        fileName: `${hostname}.html`,
                        mimetype: "text/html",
                      },
                      { quoted: m },
                    );
                    fs.unlinkSync(`./System/Cache/${hostname}.html`);
                  }
                });
              });
            });

            req.on("error", (error) => {
              console.error("[ EXCEPTION ] Execute Error:", error);
            });

            req.end();
          } else {
            let target = text.replace("--txt ", "");
            if (!target.includes("http") && !target.includes("https")) {
              target = "http://" + target;
            }
            const parsedUrl = url.parse(target);
            const hostname = parsedUrl.hostname;
            const path = parsedUrl.pathname;
            const options = {
              hostname: hostname,
              path: path,
              method: "GET",
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
                Connection: "keep-alive",
                "Accept-Language": "en-US,en;q=0.9",
                Accept:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              },
            };
            const req = https.request(options, (res) => {
              let data = "";

              res.on("data", (chunk) => {
                data += chunk;
              });

              res.on("end", () => {
                fs.writeFile(`./System/Cache/${hostname}.txt`, data, (err) => {
                  if (err) {
                    m.reply("Error: " + err.message);
                  } else {
                    const mainfile = fs.readFileSync(
                      `./System/Cache/${hostname}.txt`,
                    );
                    KAMI.sendMessage(
                      m.from,
                      {
                        document: mainfile,
                        fileName: `${hostname}.txt`,
                        mimetype: "text/plain",
                      },
                      { quoted: m },
                    );
                    fs.unlinkSync(`./System/Cache/${hostname}.txt`);
                  }
                });
              });
            });

            req.on("error", (error) => {
              console.error("[ EXCEPTION ] Execute Error:", error);
            });

            req.end();
          }
        } catch (e) {
          if (doReact) await doReact("❌");
          m.reply(`Error: ${e.message}`);
        }
        break;

      case "shorturl":
      case "short":
      case "tinyurl":
        if (!text) {
          await doReact("❔");
          return KAMI.sendMessage(
            m.from,
            { text: `❌ Example: *${prefix}shorturl https://google.com*` },
            { quoted: m },
          );
        }

        await doReact("🔗");
        try {
          let urlToShorten = text;
          if (!urlToShorten.startsWith("http://") && !urlToShorten.startsWith("https://")) {
            urlToShorten = "https://" + urlToShorten;
          }

          const resShort = await fetch(
            `https://tinyurl.com/api-create.php?url=${encodeURIComponent(urlToShorten)}`,
          );
          const short = await resShort.text();

          await KAMI.sendMessage(
            m.from,
            {
              text: `🔗 *Short URL Generated*\n\n*Original:* ${urlToShorten}\n\n*Short:* ${short}`,
            },
            { quoted: m },
          );
        } catch {
          await doReact("❌");
          await KAMI.sendMessage(
            m.from,
            { text: "❌ Failed to shorten url" },
            { quoted: m },
          );
        }
        break;

      default:
        break;
    }
  },
};
