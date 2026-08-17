import { getRandom } from "../System/Function.js";
import { webp2mp4File } from "../System/Uploader.js";
import { toAudio } from "../System/File-Converter.js";
import { execFile } from "child_process";
import fs from "fs";
import ffmpegPath from "ffmpeg-static";
import PDFDocument from "pdfkit";
import { CatboxUpload } from "../System/Uploader.js";
import { getBuffer } from "../System/Function2.js";

import util from "util";
let mergedCommands = [
  "toimg",
  "toimage",
  "togif",
  "tomp4",
  "tomp3",
  "toaudio",
  "tourl",
  "topdf",
  "imgtopdf",
  "toqr",
];

export default {
  name: "converters",
  alias: [...mergedCommands],
  uniquecommands: [
    "toimg",
    "togif",
    "tomp4",
    "tomp3",
    "toaudio",
    "tourl",
    "topdf",
    "toqr",
  ],
  description: "All converter related commands",
  start: async (
    Atlas,
    m,
    { inputCMD, text, quoted, doReact, prefix, mime },
  ) => {
    switch (inputCMD) {
      case "toimg":
      case "toimage":
        if (!m.quoted && !/webp/.test(mime)) {
          await doReact("❔");
          return m.reply(
            `Please reply to a *Non-animated* sticker to convert it to image`,
          );
        }
        await doReact("🎴");
        let mediaMess = await Atlas.downloadAndSaveMediaMessage(quoted);
        let ran = await getRandom(".png");
        execFile(ffmpegPath, ["-i", mediaMess, ran], (err) => {
          fs.unlinkSync(mediaMess);
          if (err) {
            Atlas.sendMessage(
              m.from,
              {
                text: `Please mention a *Non-animated* sticker to process ! \n\nOr use *${prefix}togif* / *${prefix}tomp4* to process *Animated* sticker !`,
              },
              { quoted: m },
            );
            return;
          }
          let buffer = fs.readFileSync(ran);
          Atlas.sendMessage(
            m.from,
            { image: buffer, caption: `_Converted by:_  *${botName}*\n` },
            { quoted: m },
          );
          fs.unlinkSync(ran);
        });
        break;

      case "tomp4":
        if (!m.quoted && !/webp/.test(mime)) {
          await doReact("❔");
          return m.reply(
            `Please reply to an *Animated* sticker to convert it to video !`,
          );
        }
        await doReact("🎴");
        let mediaMess2 = await Atlas.downloadAndSaveMediaMessage(quoted);
        let webpToMp4 = await webp2mp4File(mediaMess2);

        // Validation to prevent crash if result is null
        if (!webpToMp4 || !webpToMp4.result) {
          fs.unlinkSync(mediaMess2);
          await doReact("❌");
          return m.reply(
            "❌ Error: Failed to convert sticker to video. The server might be down or the file is too large.",
          );
        }

        await Atlas.sendMessage(
          m.from,
          {
            video: { url: webpToMp4.result },
            caption: `_Converted by:_  *${botName}*\n`,
          },
          { quoted: m },
        );
        fs.unlinkSync(mediaMess2);
        break;

      case "togif":
        if (!m.quoted && !/webp/.test(mime)) {
          await doReact("❔");
          return m.reply(
            `Please reply to an *Animated* sticker to convert it to gif !`,
          );
        }
        await doReact("🎴");
        let mediaMess3 = await Atlas.downloadAndSaveMediaMessage(quoted);
        let webpToMp42 = await webp2mp4File(mediaMess3);

        // Validation to prevent crash if result is null
        if (!webpToMp42 || !webpToMp42.result) {
          fs.unlinkSync(mediaMess3);
          await doReact("❌");
          return m.reply(
            "❌ Error: Failed to convert sticker to GIF. Please try again later.",
          );
        }

        await Atlas.sendMessage(
          m.from,
          {
            video: { url: webpToMp42.result },
            caption: `_Converted by:_  *${botName}*\n`,
            gifPlayback: true,
          },
          { quoted: m },
        );
        fs.unlinkSync(mediaMess3);
        break;

      case "tomp3":
        if (/document/.test(mime)) {
          await doReact("❌");
          return m.reply(
            `Send/Reply Video/Audio You Want To Convert Into MP3 With Caption *${prefix}tomp3*`,
          );
        }
        if (!/video/.test(mime) && !/audio/.test(mime)) {
          await doReact("❌");
          return m.reply(
            `Send/Reply Video/Audio You Want To Convert Into MP3 With Caption *${prefix}tomp3*`,
          );
        }
        if (!m.quoted) {
          await doReact("❔");
          return m.reply(
            `Send/Reply Video/Audio You Want To Convert Into MP3 With Caption ${prefix}tomp3`,
          );
        }
        await doReact("🎶");
        let media = await quoted.download();
        await Atlas.sendPresenceUpdate("recording", m.from);
        let audio = await toAudio(media, "mp4");
        Atlas.sendMessage(
          m.from,
          {
            document: audio,
            mimetype: "audio/mpeg",
            fileName: `Converted By ${botName} ${m.id}.mp3`,
          },
          { quoted: m },
        );

        break;

      case "toaudio":
        if (/document/.test(mime)) {
          await doReact("❌");
          return m.reply(
            `Send/Reply Video/Audio You Want To Convert Into MP3 With Caption *${prefix}tomp3*`,
          );
        }
        if (!/video/.test(mime) && !/audio/.test(mime)) {
          await doReact("❌");
          return m.reply(
            `Send/Reply Video/Audio You Want To Convert Into MP3 With Caption *${prefix}tomp3*`,
          );
        }
        if (!m.quoted) {
          await doReact("❔");
          return m.reply(
            `Send/Reply Video/Audio You Want To Convert Into MP3 With Caption ${prefix}tomp3`,
          );
        }
        await doReact("🎶");
        let media2 = await quoted.download();
        await Atlas.sendPresenceUpdate("recording", m.from);
        let audio2 = await toAudio(media2, "mp4");
        Atlas.sendMessage(
          m.from,
          { audio: audio2, mimetype: "audio/mpeg" },
          { quoted: m },
        );
        break;

      case "tourl":
        if (!/image|video|audio|document|octet|application/.test(mime)) {
          await doReact("❔");
          return m.reply(
            `Please send or reply to an *Image* / *Video* / *Audio* / *Document* to generate a link! With Caption ${prefix}tourl \n\n*Max file size*: 200MB`,
          );
        }
        await doReact("🔗");
        {
          let media5;
          try {
            media5 = await Atlas.downloadAndSaveMediaMessage(quoted);
            let url = await CatboxUpload(media5);
            let mediaType = /image/.test(mime)
              ? "Image"
              : /video/.test(mime)
                ? "Video"
                : /audio/.test(mime)
                  ? "Audio"
                  : "File";
            m.reply(`*Generated ${mediaType} URL:* \n\n${url}\n`);
          } catch (e) {
            console.error("[ EXCEPTION ] Tourl error:", e.message);
            await doReact("❌");
            m.reply(
              `*Upload failed!* \n\nThe media could not be downloaded or uploaded. Please try sending the file again.`,
            );
          } finally {
            if (media5 && fs.existsSync(media5)) fs.unlinkSync(media5);
          }
        }
        break;

      case "topdf":
      case "imgtopdf":
        if (/image/.test(mime)) {
          await doReact("📑");
          let mediaMess4 = await Atlas.downloadAndSaveMediaMessage(quoted);

          async function generatePDF(path) {
            return new Promise((resolve, reject) => {
              const doc = new PDFDocument();

              const imageFilePath = mediaMess4.replace(/\\/g, "/");
              doc.image(imageFilePath, 0, 0, {
                width: 612, // Standard width for filling page
                align: "center",
                valign: "center",
              });

              doc.pipe(fs.createWriteStream(path));

              doc.on("end", () => {
                resolve(path);
              });

              doc.end();
            });
          }

          try {
            let randomFileName = `./${Math.floor(
              Math.random() * 1000000000,
            )}.pdf`;
            const pdfPATH = randomFileName;
            await generatePDF(pdfPATH);

            setTimeout(async () => {
              const pdf = fs.readFileSync(pdfPATH);

              Atlas.sendMessage(
                m.from,
                {
                  document: pdf,
                  fileName: `Converted By ${botName}.pdf`,
                },
                { quoted: m },
              );

              fs.unlinkSync(mediaMess4);
              fs.unlinkSync(pdfPATH);
            }, 1000);
          } catch (error) {
            await doReact("❌");
            console.error("[ EXCEPTION ]", error);
            return m.reply(
              `An error occurred while converting the image to PDF.`,
            );
          }
        } else {
          await doReact("❔");
          return m.reply(`Please reply to an *Image* to convert it to PDF!`);
        }
        break;
      case "toqr":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide an URL to convert into QR code!\n\nExample: *${prefix}toqr https://github.com/FantoX001*`,
          );
        }

        await doReact("✅");
        const res = await getBuffer(
          `https://www.qrtag.net/api/qr_8.png?url=${text}`,
        );
        await Atlas.sendMessage(
          m.from,
          { image: res, caption: `\n*Source:* ${text}` },
          { quoted: m },
        );
        break;

      default:
        break;
    }
  },
};
