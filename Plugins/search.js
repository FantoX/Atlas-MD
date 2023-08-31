const axios = require("axios");
const yts = require("youtube-yts");
const googleit = require("google-it");
const { ringtone } = require("../System/Scrapers");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");

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
];

module.exports = {
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
  ],
  description: "All picture related commands",
  start: async (Atlas, m, { inputCMD, text, doReact, prefix, pushName }) => {
    switch (inputCMD) {
      case "google":
      case "search":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide an image Search Term !\n\nExample: *${prefix}search Free Web development Course*`
          );
        }
        await doReact("🔍");
        let googleSearch = await googleit({ query: text });
        let resText = `  *『  ⚡️ Google Search Engine ⚡️  』*\n\n\n_🔍 Search Term:_ *${text}*\n\n\n`;

        for (let num = 0; num < 10; num++) {
          resText += `_📍 Result:_ *${num + 1}*\n\n_🎀 Title:_ *${
            googleSearch[num].title
          }*\n\n_🔶 Description:_ *${
            googleSearch[num].snippet
          }*\n\n_🔷 Link:_ *${googleSearch[num].link}*\n\n\n`;
        }
        await Atlas.sendMessage(
          m.from,
          {
            video: {
              url: "https://media.tenor.com/3aaAzbTrTMwAAAPo/google-technology-company.mp4",
            },
            gifPlayback: true,
            caption: resText,
          },
          { quoted: m }
        );

        break;

      case "lyrics":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide an lyrics Search Term !\n\nExample: *${prefix}lyrics Heat waves*`
          );
        }
        await doReact("📃");
        let result = await axios.get(
          "https://fantox001-scrappy-api.vercel.app/lyrics?search=" + text
        );
        let lyrics = result.data.lyrics;
        let thumbnail = result.data.thumbnail;

        let resText2 = `  *『  ⚡️ Lyrics Search Engine ⚡️  』*\n\n\n_Search Term:_ *${text}*\n\n\n*📍 Lyrics:* \n\n${lyrics}\n\n\n_*Powered by:*_ *Scrappy API - by FantoX*\n\n_*Url:*_ https://github.com/FantoX001/Scrappy-API \n`;
        await Atlas.sendMessage(
          m.from,
          {
            image: {
              url: thumbnail,
            },
            caption: resText2,
          },
          { quoted: m }
        );

        break;

      case "yts":
      case "youtubesearch":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide an Youtube Search Term !\n\nExample: *${prefix}yts Despacito*`
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

        Atlas.sendMessage(m.from, buttonMessage, { quoted: m });
        break;

      case "ringtone":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide an ringtone Search Term !\n\nExample: *${prefix}ringtone iphone*`
          );
        }
        await doReact("🎶");
        let resultRT = await ringtone(text);
        let resultR = resultRT[Math.floor(Math.random() * resultRT.length)];
        Atlas.sendMessage(
          m.from,
          {
            audio: { url: resultR.audio },
            fileName: text + ".mp3",
            mimetype: "audio/mpeg",
          },
          { quoted: m }
        );
        break;

      case "weather":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide an ringtone Search Term !\n\n*${prefix}weather Kolkata*`
          );

        }
        await doReact("🌤");
        var myweather = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${text}&units=metric&appid=e409825a497a0c894d2dd975542234b0&language=tr`
        );

        let weathertext = `           🌤 *Weather Report* 🌤  \n\n🔎 *Search Location:* ${myweather.data.name}\n*💮 Country:* ${myweather.data.sys.country}\n🌈 *Weather:* ${myweather.data.weather[0].description}\n🌡️ *Temperature:* ${myweather.data.main.temp}°C\n❄️ *Minimum Temperature:* ${myweather.data.main.temp_min}°C\n📛 *Maximum Temperature:* ${myweather.data.main.temp_max}°C\n💦 *Humidity:* ${myweather.data.main.humidity}%\n🎐 *Wind:* ${myweather.data.wind.speed} km/h\n`;

        await Atlas.sendMessage(
          m.from,
          {
            video: {
              url: "https://media.tenor.com/bC57J4v11UcAAAPo/weather-sunny.mp4",
            },
            gifPlayback: true,
            caption: weathertext,
          },
          { quoted: m }
        );
        break;

      case "stickersearch":
      case "getsticker":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide a sticker Search Term !\n\n*${prefix}stickersearch Cheems bonk*`
          );
        }
        await doReact("🧧");
        let gif = await axios.get(
          `https://tenor.googleapis.com/v2/search?q=${text}&key=${tenorApiKey}&client_key=my_project&limit=8&media_filter=gif`
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
        Atlas.sendMessage(m.from, { sticker: stickerBuffer2 }, { quoted: m });
        break;

      case "gh":
      case "github":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide a valid *Github* username!\n\nExample: *${prefix}gh FantoX001*`
          );
        }
        await doReact("📊");
        var GHuserInfo = await axios
          .get(`https://api.github.com/users/${text}`)
          .then((response) => response.data)
          .catch((error) => {
            console.log(error);
          });
        let GhUserPP = GHuserInfo.avatar_url;
        let resText4 = `        *🏮 GitHub User Info 🏮*\n\n_🎀 Username:_ *${GHuserInfo.login}*\n_🧩 Name:_ *${GHuserInfo.name}*\n\n_🧣 Bio:_ *${GHuserInfo.bio}*\n\n_🍁 Total Followers:_ *${GHuserInfo.followers}*\n_🔖 Total Public Repos:_ *${GHuserInfo.public_repos}*\n_📌 Website:_ ${GHuserInfo.blog}\n`;

        Atlas.sendMessage(
          m.from,
          {
            image: { url: GhUserPP, mimetype: "image/jpeg" },
            caption: resText4,
          },
          { quoted: m }
        );
        break;

      default:
        break;
    }
  },
};
