const Jimp = require("jimp");
const Canvacord = require("canvacord");
const fs = require("fs");
const remobg = require("remove.bg");
const { Sticker } = require("wa-sticker-formatter");
let mergedCommands = ["blur", "circle", "jail", "removebg"];

module.exports = {
  name: "audioedit",
  uniquecommands: ["blur", "circle", "jail", "removebg"],
  alias: [...mergedCommands],
  description: "All Image Editing Commands",
  start: async (Atlas, m, { inputCMD, text, doReact, mime, quoted }) => {
    switch (inputCMD) {
      case "blur":
        if (!m.quoted && !/image/.test(mime)) {
          await doReact("❔");
          return m.reply("Please tag someone ! or mention a picture !");
        }

        if (/image/.test(mime)) {
          userPfp = await quoted.download();
        } else if (m.quoted) {
          try {
            userPfp = await Atlas.profilePictureUrl(m.quoted.sender, "image");
          } catch (e) {
            await doReact("❌");
            return m.reply(
              "User profile pic is Private ! or User doesn't have any profile picture !"
            );
          }
        } else {
          await doReact("❔");
          return m.reply("Please tag someone ! or mention a picture !");
        }
        await doReact("✔️");

        let level = text.split(" ")[1] || 5;
        const img = await Jimp.read(userPfp);
        img.blur(isNaN(level) ? 5 : parseInt(level));

        img.getBuffer(`image/png`, (err, buffer) => {
          if (!err) {
            Atlas.sendMessage(
              m.from,
              { image: buffer, caption: `_Created by:_ *${botName}*` },
              { quoted: m }
            );
          } else {
            console.error(err);
            m.reply("An error occurd !");
          }
        });
        break;

      case "circle":
        if (/image/.test(mime)) {
          let mediaMess = await quoted.download();
          await doReact("🔘");
          await Jimp.read(mediaMess).then((image) => {
            return image.circle().getBuffer(Jimp.MIME_JPEG, (err, buffer) => {
              if (!err) {
                Atlas.sendMessage(
                  m.from,
                  { image: buffer, caption: `_Created by:_ *${botName}*` },
                  { quoted: m }
                );
              } else {
                console.error(err);
              }
            });
          });
        } else {
          await doReact("❌");
          return m.reply(
            `Please mention an *imade* and type *${prefix}circle* to create circle image.`
          );
        }
        break;

      case "jail":
        if (!m.quoted && !/image/.test(mime)) {
          await doReact("❔");
          return m.reply("Please tag someone ! or mention a picture !");
        }

        if (/image/.test(mime)) {
          userPfp = await quoted.download();
        } else if (m.quoted) {
          try {
            userPfp = await Atlas.profilePictureUrl(m.quoted.sender, "image");
          } catch (e) {
            await doReact("❌");
            return m.reply(
              "User profile pic is Private ! or User doesn't have any profile picture !"
            );
          }
        } else {
          await doReact("❔");
          return m.reply("Please tag someone ! or mention a picture !");
        }
        await doReact("🔲");
        const result = await Canvacord.Canvacord.jail(userPfp, false);

        await Atlas.sendMessage(
          m.from,
          { image: result, caption: "*Sent to Horney jail*\n" },
          { quoted: m }
        );
        break;

      case "removebg":
        if (!m.quoted || !/image/.test(mime)){
          await doReact("❌");
          return m.reply(
            `Send/Reply Image With Caption *${prefix}removebg* to remove background of an image`
          );}
        if (/webp/.test(mime)){
          await doReact("❌");
          return m.reply(
            `Send/Reply Image With Caption *${prefix}removebg* to remove background of an image`
          );}

        let rbgKEYS = [
          "cHLxHkyovvnFKA46bWDoy5ab0",
          "tgrhopqLJG5cz17zr9GFVRSP",
          "dCtKvWzkwn4eAYkxF3jUg95h",
          "FxhCoWrhbjE5rGdQcQXrR6L1",
          "xw2tzRUfTwNpPCqApBk3PMgP",
          "bCnoXofBNXHhwSeWibivduAX",
          "mjU2LCkHRuLgd3k9NK93LsL1",
          "P3SisAFSGsziMmYv3tpkDLQu",
          "V5mjnCXBaT58rHiuZ3pCTop7",
          "UTs581jS1xMJ87biGKtpK6UL",
          "pcmigrMzg2H3nzd85eQ68U8Q",
          "pTF2W31Ntre5Ec97p9fD1Nap",
          "vXJLm54AGNRooqi88NXYUuqJ",
          "8j8rHjhPjaFj9qeJqQJmLJCo",
          "YG1Yx54XvFTeP6jgYoMZ3yra",
          "HFvTxMoL774caaXKXKtDiAbw",
          "wdCwvvbEDeLUvR2XBDCzSWxR",
          "9KgH3vFP23NGQKzUYZhyL16Y",
          "5aCUhqDEKWUgqpSXWCsPDRRM",
          "ciyXBRKUd5mmUEfcraF1WZTN",
          "Bfx67bQNp1Lgash3ataGuDYw",
          "HxdQxBahc9rynzSU8RFdenf8",
          "1RPRXsyt9rWmk3NDeELpc5G2",
          "ogbK8qR76TwPkqWwixd9Wnhi",
          "5CDjT5zPwieCFeHiThsTuEvT",
          "JLzxsmoky8YmqdGM4eBa86wx",
          "SrpQNJ6ssj6toDkcwhA5uxKv",
          "ZCSfHCPEe4RQuBgdy5LbjUxL",
          "PFkSukBFzFStuBKHapALVttj",
          "Rr3sRLQAekVRCAcaGuBTbaxr",
          "BbVBkKMMp59qXLCRoSvtm5Tp",
          "xXuiVxrAS3Qk7Si51UWprQeG",
          "Whr6m2QSkjasePMyMU4orrAU",
          "E4vWPfH3byqwSTkfggPQRqmL",
          "a5n2sDUsvtWEARYcvwaY4EiB",
          "MJmfELQUKrsGxu2R3hUTssKf",
          "TqEXtH2h6nZCFhmCrQ2gcE9J",
          "NedwN3261hZyRAnCVhfzCqJ1",
          "zsCdiRN4wudN7jYAwY1GERvm",
          "8tWCT9HwwvNTCgjRDsSNgsHX",
          "rESyw5wJ1CqpcxR6aMPdB1ha",
          "Je1FxvZB3a6C8JKz13bKhSuS",
          "YEX4hMCDrmS2NaZpnNspWFhf",
          "TC5JudsLRVdgFGqtWFtgrsnX",
          "7gf3ewFyRzLG2z8zL9zhDAeR",
          "gBrCeHBUHctye4fjMoJjFwkR",
          "bEFeCrEUQzAKzaQfMCkMoS1y",
          "sg1Cha6PNzSpaLgYQxiAegNZ",
          "EpRzXpncobaNKATWLppj5v8s",
          "cX3yucYC6KGb9U7ZqetGz91z",
        ];
        await doReact("☯️");
        let rbgKEY = rbgKEYS[Math.floor(Math.random() * rbgKEYS.length)];
        let outputFile = await "./System/Cache/removeBgOUT.png";
        let qFile = await Atlas.downloadAndSaveMediaMessage(quoted);

        var bgRempic = await remobg.removeBackgroundFromImageFile({
          path: qFile,
          apiKey: rbgKEY,
          size: "regular",
          type: "auto",
          scale: "100%",
          outputFile,
        });

        await Atlas.sendMessage(
          m.from,
          {
            image: fs.readFileSync(outputFile),
            caption: `_Created by: *${botName}*_`,
          },
          { quoted: m }
        );
        fs.unlinkSync(qFile);
        fs.unlinkSync(outputFile);
        break;

      default:
        break;
    }
  },
};
