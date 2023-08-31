const {
  banUser, //----------------------- BAN
  checkBan, // --------------------- CHECK BAN STATUS
  unbanUser, // -------------------- UNBAN
  addMod, // ----------------------- ADD MOD
  checkMod, // --------------------- CHECK MOD STATUS
  delMod, // ----------------------- DEL MOD
  setChar, // ---------------------- SET CHAR ID
  getChar, // ---------------------- GET CHAR ID
  activateChatBot, // -------------- ACTIVATE PM CHATBOT
  checkPmChatbot, // --------------- CHECK PM CHATBOT STATUS
  deactivateChatBot, // ------------ DEACTIVATE PM CHATBOT
  setBotMode, // ------------------- SET BOT MODE
  getBotMode, // ------------------- GET BOT MODE
  banGroup, // --------------------- BAN GROUP
  checkBanGroup, //----------------- CHECK BAN STATUS OF A GROUP
  unbanGroup, // ------------------- UNBAN GROUP
} = require("../System/MongoDB/MongoDb_Core");

const { userData } = require("../System/MongoDB/MongoDB_Schema.js");

let mergedCommands = [
  "addmod",
  "setmod",
  "delmod",
  "removemod",
  "modlist",
  "mods",
  "ban",
  "banuser",
  "unban",
  "unbanuser",
  "banlist",
  "listbans",
  "setchar",
  "dmchatbot",
  "pmchatbot",
  "bangroup",
  "bangc",
  "unbangroup",
  "unbangc",
  "setbotmode",
  "mode",
];

module.exports = {
  name: "moderators",
  alias: [...mergedCommands],
  uniquecommands: [
    "addmod",
    "delmod",
    "mods",
    "ban",
    "unban",
    "banlist",
    "setchar",
    "pmchatbot",
    "bangroup",
    "unbangroup",
    "mode",
  ],
  description: "All Moderator/Owner Commands",
  start: async (
    Atlas,
    m,
    {
      inputCMD,
      text,
      mods,
      isCreator,
      banData,
      prefix,
      db,
      isintegrated,
      doReact,
      args,
      itsMe,
      participants,
      metadata,
      mentionByTag,
      mime,
      isMedia,
      quoted,
      botNumber,
      isBotAdmin,
      groupAdmin,
      isAdmin,
      pushName,
      groupName,
    }
  ) => {
    isUsermod = await checkMod(m.sender);
    if (!isCreator && !isintegrated && !isUsermod) {
      await doReact("❌");
      return m.reply("Sorry, only my *Mods* can use this command !");
    }
    switch (inputCMD) {
      case "addmod":
      case "setmod":
        if (!text && !m.quoted) {
          await doReact("❌");
          return m.reply(`Please tag a user to make *mod*!`);
        }
        mentionedUser = m.quoted ? m.quoted.sender : mentionByTag[0];
        userId = mentionedUser;
        isUsermod = await checkMod(userId);
        if (!isCreator && !isintegrated && isUsermod) {
          await doReact("❌");
          return m.reply(
            "Sorry, only my *Owner* can use this command ! *Added Mods* does not have this permission."
          );
        }
        if (!userId) return m.reply("Please mention a valid user to ban!");

        try {
          if (isUsermod) {
            await doReact("✅");
            return Atlas.sendMessage(
              m.from,
              {
                text: `@${userId.split("@")[0]} is already registered as a mod`,
                mentions: [userId],
              },
              { quoted: m }
            );
          }

          // Add user to the mods list and save to the database
          await doReact("✅");
          await addMod(userId)
            .then(() => {
              Atlas.sendMessage(
                m.from,
                {
                  text: `@${
                    userId.split("@")[0]
                  } is successfully registered to mods`,
                  mentions: [userId],
                },
                { quoted: m }
              );
            })
            .catch((err) => {
              console.log(err);
            });
        } catch (err) {
          console.log(err);
        }
        break;

      case "delmod":
      case "removemod":
        // Check if a user is mentioned
        if (!text && !m.quoted) {
          await doReact("❔");
          return m.reply(`Please tag a user to remove from *mod*!`);
        }
        mentionedUser = m.quoted ? m.quoted.sender : mentionByTag[0];
        userId = mentionedUser;
        isUsermod = await checkMod(userId);
        if (!isCreator && !isintegrated && isUsermod) {
          await doReact("❌");
          return m.reply(
            "Sorry, only my *Owner* can use this command ! *Added Mods* does not have this permission."
          );
        }
        if (!userId) return m.reply("Please mention a valid user to ban!");

        try {
          if (!isUsermod) {
            await doReact("✅");
            return Atlas.sendMessage(
              m.from,
              {
                text: `@${userId.split("@")[0]} is not registered as a mod !`,
                mentions: [userId],
              },
              { quoted: m }
            );
          }

          await delMod(userId)
            .then(() => {
              Atlas.sendMessage(
                m.from,
                {
                  text: `@${
                    userId.split("@")[0]
                  } is successfully removed to mods`,
                  mentions: [userId],
                },
                { quoted: m }
              );
            })
            .catch((err) => {
              console.log(err);
            });
        } catch (err) {
          console.log(err);
        }
        break;

      case "modlist":
      case "mods":
        await doReact("✅");
        try {
          var modlist = await userData.find({ addedMods: "true" });
          var modlistString = "";
          var ownerList = global.owner;
          modlist.forEach((mod) => {
            modlistString += `\n@${mod.id.split("@")[0]}\n`;
          });
          var mention = await modlist.map((mod) => mod.id);
          let xy = modlist.map((mod) => mod.id);
          let yz = ownerList.map((owner) => owner + "@s.whatsapp.net");
          let xyz = xy.concat(yz);

          ment = [ownerList.map((owner) => owner + "@s.whatsapp.net"), mention];
          let textM = `    🧣  *${botName} Mods*  🧣\n\n`;

          if (ownerList.length == 0) {
            textM = "*No Mods Added !*";
          }

          textM += `\n〽️ *Owners* 〽️\n`;

          for (var i = 0; i < ownerList.length; i++) {
            textM += `\n〄  @${ownerList[i]}\n`;
          }

          if (modlistString != "") {
            textM += `\n🧩 *Added Mods* 🧩\n`;
            for (var i = 0; i < modlist.length; i++) {
              textM += `\n〄  @${modlist[i].id.split("@")[0]}\n`;
            }
          }

          if (modlistString != "" || ownerList.length != 0) {
            textM += `\n\n📛 *Don't Spam them to avoid Blocking !*\n\n🎀 For any help, type *${prefix}support* and ask in group.\n\n*💫 Thanks for using ${botName}. 💫*\n`;
          }

          Atlas.sendMessage(
            m.from,
            {
              video: { url: botVideo },
              gifPlayback: true,
              caption: textM,
              mentions: xyz,
            },
            { quoted: m }
          );
        } catch (err) {
          console.log(err);
          await doReact("❌");
          return Atlas.sendMessage(
            m.from,
            { text: `An internal error occurred while fetching the mod list.` },
            { quoted: m }
          );
        }

        break;

      case "ban":
      case "banuser":
        if (!text && !m.quoted) {
          await doReact("❌");
          return Atlas.sendMessage(
            m.from,
            { text: `Please tag a user to *Ban*!` },
            { quoted: m }
          );
        } else if (m.quoted) {
          var mentionedUser = m.quoted.sender;
        } else {
          var mentionedUser = mentionByTag[0];
        }
        chechSenderModStatus = await checkMod(m.sender);
        if (!chechSenderModStatus && !isCreator && !isintegrated) {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `Sorry, only *Owners* and *Mods* can use this command !`,
            quoted: m,
          });
        }
        userId = (await mentionedUser) || m.msg.contextInfo.participant;
        chechBanStatus = await checkBan(userId);
        checkUserModStatus = await checkMod(userId);
        userNum = userId.split("@")[0];
        globalOwner = global.owner;
        if (checkUserModStatus == true || globalOwner.includes(userNum)) {
          await doReact("❌");
          return m.reply(`Sorry, I can't ban an *Owner* or *Mod* !`);
        }
        if (chechBanStatus) {
          await doReact("✅");
          return Atlas.sendMessage(
            m.from,
            {
              text: `@${mentionedUser.split("@")[0]} is already *Banned* !`,
              mentions: [mentionedUser],
            },
            { quoted: m }
          );
        } else {
          banUser(userId).then(async () => {
            await doReact("✅");
            await Atlas.sendMessage(
              m.from,
              {
                text: `@${
                  mentionedUser.split("@")[0]
                } has been *Banned* Successfully by *${pushName}*`,
                mentions: [mentionedUser],
              },
              { quoted: m }
            );
          });
        }

        break;

      case "unban":
      case "unbanuser":
        if (!text && !m.quoted) {
          await doReact("❌");
          return m.reply(`Please tag a user to *Un-Ban*!`);
        } else if (m.quoted) {
          var mentionedUser = m.quoted.sender;
        } else {
          var mentionedUser = mentionByTag[0];
        }
        chechSenderModStatus = await checkMod(m.sender);
        if (!chechSenderModStatus && !isCreator && !isintegrated) {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `Sorry, only *Owners* and *Mods* can use this command !`,
            quoted: m,
          });
        }
        userId = (await mentionedUser) || m.msg.contextInfo.participant;
        chechBanStatus = await checkBan(userId);
        if (chechBanStatus) {
          unbanUser(userId).then(async () => {
            await doReact("✅");
            await Atlas.sendMessage(
              m.from,
              {
                text: `@${
                  mentionedUser.split("@")[0]
                } has been *Un-Banned* Successfully by *${pushName}*`,
                mentions: [mentionedUser],
              },
              { quoted: m }
            );
          });
        } else {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `@${mentionedUser.split("@")[0]} is not *Banned* !`,
            mentions: [mentionedUser],
            quoted: m,
          });
        }
        break;

      case "setchar":
        if (!text) {
          await doReact("❌");
          return Atlas.sendMessage(
            m.from,
            { text: `Please enter a character number between 0-19 to set !` },
            { quoted: m }
          );
        }
        chechSenderModStatus = await checkMod(m.sender);
        if (!chechSenderModStatus && !isCreator && !isintegrated) {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `Sorry, only *Owners* and *Mods* can use this command !`,
            quoted: m,
          });
        }

        const intinput = parseInt(text);
        if (intinput < 0 || intinput > 19) {
          await doReact("❌");
          return Atlas.sendMessage(
            m.from,
            { text: `Please enter a character number between 0-19 to set !` },
            { quoted: m }
          );
        }
        const botNames = [
          "Atlas MD",
          "Power",
          "Makima",
          "Denji",
          "Zero Two",
          "Chika",
          "Miku",
          "Marin",
          "Ayanokoji",
          "Ruka",
          "Mizuhara",
          "Rem",
          "Sumi",
          "Kaguya",
          "Yumeko",
          "Kurumi",
          "Mai",
          "Yor",
          "Shinbou",
          "Eiko",
        ];
        const botLogos = [
          "https://wallpapercave.com/wp/wp5924545.jpg",
          "https://wallpapercave.com/wp/wp11253614.jpg",
          "https://images5.alphacoders.com/126/1264439.jpg",
          "https://i0.wp.com/metagalaxia.com.br/wp-content/uploads/2022/11/Chainsaw-Man-Denji-e-Power.webp?resize=1068%2C601&ssl=1",
          "https://images3.alphacoders.com/949/949253.jpg",
          "https://images4.alphacoders.com/100/1002134.png",
          "https://wallpapercave.com/wp/wp10524580.jpg",
          "https://images2.alphacoders.com/125/1257915.jpg",
          "https://wallpapers.com/images/file/kiyotaka-ayanokoji-in-pink-qs33qgqm79ccsq7n.jpg",
          "https://wallpapercave.com/wp/wp8228630.jpg",
          "https://images3.alphacoders.com/128/1288059.png",
          "https://images.alphacoders.com/711/711900.png",
          "https://moewalls.com/wp-content/uploads/2022/07/sumi-sakurasawa-hmph-rent-a-girlfriend-thumb.jpg",
          "https://wallpapercave.com/wp/wp6099650.png",
          "https://wallpapercave.com/wp/wp5017991.jpg",
          "https://wallpapercave.com/wp/wp2535489.jpg",
          "https://images4.alphacoders.com/972/972790.jpg",
          "https://images7.alphacoders.com/123/1236729.jpg",
          "https://wallpapercave.com/wp/wp4650481.jpg",
          "https://images8.alphacoders.com/122/1229829.jpg",
        ];

        checkChar = await getChar();
        if (checkChar === intinput) {
          await doReact("✅");
          return Atlas.sendMessage(
            m.from,
            {
              image: { url: botLogos[intinput] },
              caption: `Character number *${intinput}* - *${botNames[intinput]}* is already default !`,
            },
            { quoted: m }
          );
        }
        await doReact("✅");
        await setChar(intinput);
        await Atlas.sendMessage(
          m.from,
          {
            image: { url: botLogos[intinput] },
            caption: `Character number *${intinput}* - *${botNames[intinput]}* has been set Successfully by *${pushName}*`,
          },
          { quoted: m }
        );
        break;

      case "dmchatbot":
      case "pmchatbot":
        if (!text) {
          await doReact("❌");
          return m.reply(
            `Please provide On / Off action !\n\n*Example:*\n\n${prefix}pmchatbot on`
          );
        }
        chechSenderModStatus = await checkMod(m.sender);
        if (!chechSenderModStatus && !isCreator && !isintegrated) {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `Sorry, only *Owners* and *Mods* can use this command !`,
            quoted: m,
          });
        }
        pmChatBotStatus = await checkPmChatbot();
        await doReact("🧩");
        if (args[0] === "on") {
          if (pmChatBotStatus) {
            await doReact("❌");
            return Atlas.sendMessage(m.from, {
              text: `Private Chatbot is already *Enabled* !`,
              quoted: m,
            });
          } else {
            await activateChatBot();
            await m.reply(
              `*PM Chatbot* has been *Enabled* Successfully ! \n\nBot will reply to all chats in PM !`
            );
          }
        } else if (args[0] === "off") {
          if (!pmChatBotStatus) {
            await doReact("❌");
            return Atlas.sendMessage(m.from, {
              text: `Private Chatbot is already *Disabled* !`,
              quoted: m,
            });
          } else {
            await deactivateChatBot();
            await m.reply(`*PM Chatbot* has been *Disabled* Successfully !`);
          }
        } else {
          await doReact("❌");
          return m.reply(
            `Please provide On / Off action !\n\n*Example:*\n\n${prefix}pmchatbot on`
          );
        }

        break;

      case "bangroup":
      case "bangc":
        if (!m.isGroup) {
          await doReact("❌");
          return m.reply(`This command can only be used in groups !`);
        }

        chechSenderModStatus = await checkMod(m.sender);
        if (!chechSenderModStatus && !isCreator && !isintegrated) {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `Sorry, only *Owners* and *Mods* can use this command !`,
            quoted: m,
          });
        }

        groupBanStatus = await checkBanGroup(m.from);
        if (groupBanStatus) {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `This group is already *Banned* !`,
            quoted: m,
          });
        } else {
          await doReact("🧩");
          await banGroup(m.from);
          await m.reply(`*${groupName}* has been *Banned* Successfully !`);
        }

        break;

      case "unbangroup":
      case "unbangc":
        if (!m.isGroup) {
          await doReact("❌");
          return m.reply(`This command can only be used in groups !`);
        }

        chechSenderModStatus = await checkMod(m.sender);
        if (!chechSenderModStatus && !isCreator && !isintegrated) {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `Sorry, only *Owners* and *Mods* can use this command !`,
            quoted: m,
          });
        }

        groupBanStatus = await checkBanGroup(m.from);
        if (!groupBanStatus) {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `This group is not banned !`,
            quoted: m,
          });
        } else {
          await doReact("🧩");
          await unbanGroup(m.from);
          await m.reply(`*${groupName}* has been *Unbanned* Successfully !`);
        }

        break;

      case "setbotmode":
      case "mode":
        if (!text) {
          await doReact("❌");
          return m.reply(
            `Please provide *Self / Private / Public* mode names !\n\n*Example:*\n\n${prefix}mode public`
          );
        }

        chechSenderModStatus = await checkMod(m.sender);
        if (!chechSenderModStatus && !isCreator && !isintegrated) {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `Sorry, only *Owners* and *Mods* can use this command !`,
            quoted: m,
          });
        }

        chechbotMode = await getBotMode();

        if (args[0] == "self") {
          if (chechbotMode == "self") {
            await doReact("❌");
            return m.reply(
              `Bot is already in *Self* mode !\n\nOnly *Bot Hoster (Bot number)* can use bot.`
            );
          } else {
            await doReact("🧩");
            await setBotMode("self");
            await m.reply(`Bot has been set to *Self* mode Successfully !`);
          }
        } else if (args[0] == "private") {
          if (chechbotMode == "private") {
            await doReact("❌");
            return m.reply(
              `Bot is already in *Private* mode !\n\nOnly bot *Owners / Mods* can use bot.`
            );
          } else {
            await doReact("🧩");
            await setBotMode("private");
            await m.reply(`Bot has been set to *Private* mode Successfully !`);
          }
        } else if (args[0] == "public") {
          if (chechbotMode == "public") {
            await doReact("❌");
            return m.reply(
              `Bot is already in *Public* mode !\n\nAnyone can use bot.`
            );
          } else {
            await doReact("🧩");
            await setBotMode("public");
            await m.reply(`Bot has been set to *Public* mode Successfully !`);
          }
        } else {
          await doReact("❌");
          return m.reply(
            `Please provide *Self / Private / Public* mode names !\n\n*Example:*\n\n${prefix}mode public`
          );
        }

        break;

      default:
        break;
    }
  },
};
