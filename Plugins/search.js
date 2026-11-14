import axios from "axios";
import yts from "youtube-yts";
import { searchit } from "@fantox01/search-it";
import { ringtone, wallpaper } from "../System/Scrapers.js";
import { Sticker, StickerTypes } from "wa-sticker-formatter";
import { getLyrics } from "@fantox01/lyrics-scraper";

let mergedCommands = [
  "google",
  "search",
  "lyrics",
  "yts",
  "youtubesearch",
  "ringtone",
  "stickersearch",
  "getsticker",
  "weather",
  "github",
  "gh",
  "wallpaper",
  "wall",
  "wikipedia",
  "wiki",
];

export default {
  name: "searches",
  alias: [...mergedCommands],
  uniquecommands: [
    "google",
    "lyrics",
    "yts",
    "ringtone",
    "stickersearch",
    "weather",
    "github",
    "wallpaper",
    "wikipedia",
  ],
  description: "All picture related commands",
  start: async (KAMI, m, { inputCMD, text, doReact, prefix, pushName }) => {
    switch (inputCMD) {
      case "google":
      case "search":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide an image Search Term !\n\nExample: *${prefix}search Free Web development Course*`,
          );
        }
        await doReact("🔍");
        try {
          const googleSearch = await searchit(text, 10);
          if (!googleSearch || googleSearch.length === 0) {
            await doReact("❌");
            return m.reply(`No results found for: *${text}*`);
          }
          let resText = `  *『  ⚡️ Google Search Engine ⚡️  』*\n\n\n_🔍 Search Term:_ *${text}*\n\n\n`;
          for (const result of googleSearch) {
            resText += `_📍 Result:_ *${result.index + 1}*\n\n_🎀 Title:_ *${result.page}*\n\n_🔶 Description:_ *${result.desc}*\n\n_🔷 Link:_ *${result.url}*\n\n\n`;
          }
          await KAMI.sendMessage(
            m.from,
            {
              video: {
                url: "https://media.tenor.com/3aaAzbTrTMwAAAPo/google-technology-company.mp4",
              },
              gifPlayback: true,
              caption: resText,
            },
            { quoted: m },
          );
        } catch (err) {
          console.error("Search error:", err);
          await doReact("❌");
          return m.reply(`An error occurred while searching for: *${text}*`);
        }
        break;

      case "lyrics":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide an lyrics Search Term !\n\nExample: *${prefix}lyrics Heat waves*`,
          );
        }
        await doReact("📃");
        await KAMI.sendPresenceUpdate('composing', m.from);
        try {
          let result = await getLyrics(text);
          if (
            result &&
            result.status !== 500 &&
            result.lyrics &&
            result.thumbnail
          ) {
            let resText2 = `  *『  ⚡️ Lyrics Search Engine ⚡️  』*\n\n\n_Search Term:_ *${text}*\n\n\n*📍 Lyrics:* \n\n${result.lyrics}\n\n\n_*Powered by:*_ *Lyrics Scraper - by FantoX*\n\n_*Url:*_ https://github.com/FantoX/lyrics-scraper \n`;
            await KAMI.sendMessage(
              m.from,
              {
                image: {
                  url: result.thumbnail,
                },
                caption: resText2,
              },
              { quoted: m },
            );
          } else {
            await doReact("❌");
            return m.reply(
              result?.message ||
                `Unable to find lyrics for the song: *${text}*`,
            );
          }
        } catch (err) {
          console.error("Lyrics Error:", err);
          await doReact("❌");
          return m.reply(
            `An error occurred while fetching lyrics for: *${text}*`,
          );
        }

        break;

      case "yts":
      case "youtubesearch":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide an Youtube Search Term !\n\nExample: *${prefix}yts Despacito*`,
          );
        }
        await doReact("📜");
        let search = await yts(text);
        let thumbnail2 = search.all[0].thumbnail;
        let num = 1;

        let txt2 = `*🏮 YouTube Search Engine 🏮*\n\n_🧩 Search Term:_ *${text}*\n\n*📌 Total Results:* *${search.all.length}*\n`;
        for (let i of search.all) {
          txt2 += `\n_Result:_ *${num++}*\n_🎀 Title:_ *${
            i.title
          }*\n_🔶 Duration:_ *${i.timestamp}*\n_🔷 Link:_ ${i.url}\n\n`;
        }

        /*let nums =1;
        let sections = [];
    for (let i of search.all) {
      let list = {
        title: `Result: ${nums++}`,
        rows: [
          {
            title: `${i.title}`,
            rowId: `${prefix}play ${i.title}`,
            description: `Duration: ${i.timestamp}`,
          },
        ],
      };
      sections.push(list);
    }
    var txt2 = `*🏮 YouTube Search Engine 🏮*\n\n_🧩 Search Term:_ *${text}*\n\n*📌 Total Results:* *${search.all.length}*\n`;*/

        let buttonMessage = {
          image: { url: thumbnail2 },
          caption: txt2,
          //footer: `*${botName}*`,
          //buttonText: "Choose Song",
          //sections,
        };

        KAMI.sendMessage(m.from, buttonMessage, { quoted: m });
        break;

      case "ringtone":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide an ringtone Search Term !\n\nExample: *${prefix}ringtone iphone*`,
          );
        }
        await doReact("🎶");
        let resultRT = await ringtone(text);
        let resultR = resultRT[Math.floor(Math.random() * resultRT.length)];
        KAMI.sendMessage(
          m.from,
          {
            audio: { url: resultR.audio },
            fileName: text + ".mp3",
            mimetype: "audio/mpeg",
          },
          { quoted: m },
        );
        break;

      case "weather":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide an ringtone Search Term !\n\n*${prefix}weather Kolkata*`,
          );
        }
        await doReact("🌤");
        const myweather = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${text}&units=metric&appid=e409825a497a0c894d2dd975542234b0&language=tr`,
        );

        let weathertext = `           🌤 *Weather Report* 🌤  \n\n🔎 *Search Location:* ${myweather.data.name}\n*💮 Country:* ${myweather.data.sys.country}\n🌈 *Weather:* ${myweather.data.weather[0].description}\n🌡️ *Temperature:* ${myweather.data.main.temp}°C\n❄️ *Minimum Temperature:* ${myweather.data.main.temp_min}°C\n📛 *Maximum Temperature:* ${myweather.data.main.temp_max}°C\n💦 *Humidity:* ${myweather.data.main.humidity}%\n🎐 *Wind:* ${myweather.data.wind.speed} km/h\n`;

        await KAMI.sendMessage(
          m.from,
          {
            video: {
              url: "https://media.tenor.com/bC57J4v11UcAAAPo/weather-sunny.mp4",
            },
            gifPlayback: true,
            caption: weathertext,
          },
          { quoted: m },
        );
        break;

      case "stickersearch":
      case "getsticker":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide a sticker Search Term !\n\n*${prefix}stickersearch Cheems bonk*`,
          );
        }
        await doReact("🧧");
        let gif = await axios.get(
          `https://tenor.googleapis.com/v2/search?q=${text}&key=${tenorApiKey}&client_key=my_project&limit=8&media_filter=gif`,
        );
        let resultst = Math.floor(Math.random() * 8);
        let gifUrl = gif.data.results[resultst].media_formats.gif.url;

        let response = await axios.get(gifUrl, {
          responseType: "arraybuffer",
        });
        let buffer = Buffer.from(response.data, "utf-8");

        let stickerMess = new Sticker(buffer, {
          pack: packname,
          author: pushName,
          type: StickerTypes.FULL,
          categories: ["🤩", "🎉"],
          id: "12345",
          quality: 60,
          background: "transparent",
        });
        let stickerBuffer2 = await stickerMess.toBuffer();
        KAMI.sendMessage(m.from, { sticker: stickerBuffer2 }, { quoted: m });
        break;

      case "gh":
      case "github":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide a valid *Github* username!\n\nExample: *${prefix}gh FantoX001*`,
          );
        }
        await doReact("📊");
        let GHuserInfo;
        try {
          const ghRes = await axios.get(`https://api.github.com/users/${text}`);
          GHuserInfo = ghRes.data;
        } catch (error) {
          await doReact("❌");
          return m.reply(
            `GitHub user not found or API error: ${error.message}`,
          );
        }
        const GhUserPP = GHuserInfo.avatar_url;
        let resText4 = `        *🏮 GitHub User Info 🏮*\n\n_🎀 Username:_ *${GHuserInfo.login}*\n_🧩 Name:_ *${GHuserInfo.name}*\n\n_🧣 Bio:_ *${GHuserInfo.bio}*\n\n_🍁 Total Followers:_ *${GHuserInfo.followers}*\n_🔖 Total Public Repos:_ *${GHuserInfo.public_repos}*\n_📌 Website:_ ${GHuserInfo.blog}\n`;

        KAMI.sendMessage(
          m.from,
          {
            image: { url: GhUserPP, mimetype: "image/jpeg" },
            caption: resText4,
          },
          { quoted: m },
        );
        break;

      case "wallpaper":
      case "wall":
        if (!text) {
          await doReact("❔");
          return m.reply(`Please provide a wallpaper search term!\n\nExample: *${prefix}wallpaper nature*`);
        }
        await doReact("🖼️");
        try {
          const results = await wallpaper(text);
          if (!results || !results.length) {
            await doReact("❌");
            return m.reply(`No wallpapers found for: *${text}*`);
          }
          const picked = results[Math.floor(Math.random() * Math.min(results.length, 10))];
          const imgUrl = picked.image[0] || picked.image[1] || picked.image[2];
          if (!imgUrl) {
            await doReact("❌");
            return m.reply(`No wallpapers found for: *${text}*`);
          }
          const caption = `🖼️ *${picked.title || text}*\n_Type:_ ${picked.type || "Wallpaper"}\n\n_🧩 Powered by_ *${botName}*`;
          await KAMI.sendMessage(m.from, { image: { url: imgUrl }, caption }, { quoted: m });
        } catch (err) {
          console.error("[ WALLPAPER ] Error:", err.message);
          await doReact("❌");
          m.reply(`Wallpaper search failed: ${err.message}`);
        }
        break;

      case "wikipedia":
      case "wiki":
        if (!text) {
          await doReact("❔");
          return m.reply(`Please provide a search term!\n\nExample: *${prefix}wiki Elon Musk*`);
        }
        await doReact("📖");
        try {
          // Search for the best matching article
          const searchRes = await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`,
            {
              timeout: 10000,
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" },
            }
          );
          const { title, extract, thumbnail, content_urls } = searchRes.data;
          if (!extract) {
            await doReact("❌");
            return m.reply(`No Wikipedia article found for: *${text}*`);
          }
          // Trim extract to 800 chars
          const summary = extract.length > 800 ? extract.slice(0, 800) + "..." : extract;
          const caption = `📖 *${title}*\n\n${summary}\n\n🔗 ${content_urls?.desktop?.page || ""}`;
          if (thumbnail?.source) {
            await KAMI.sendMessage(m.from, { image: { url: thumbnail.source }, caption }, { quoted: m });
          } else {
            await KAMI.sendMessage(m.from, { text: caption }, { quoted: m });
          }
        } catch (err) {
          if (err.response?.status === 404) {
            await doReact("❌");
            return m.reply(`No Wikipedia article found for: *${text}*`);
          }
          console.error("[ WIKI ] Error:", err.message);
          await doReact("❌");
          m.reply(`Wikipedia search failed: ${err.message}`);
        }
        break;

      default:
        break;
    }
  },
};
