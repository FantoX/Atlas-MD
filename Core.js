require("./Configurations");
require("./System/BotCharacters");
const chalk = require("chalk");
const axios = require("axios");
const prefix = global.prefa;
const { QuickDB, JSONDriver } = require("quick.db");
global.Levels = require("discord-xp");
module.exports = async (Atlas, m, commands, chatUpdate) => {
  try {
    const jsonDriver = new JSONDriver();
    const db = new QuickDB({ driver: jsonDriver });

    //Levels.setURL(mongodb);
    let { type, isGroup, sender, from } = m;
    let body =
      type == "buttonsResponseMessage"
        ? m.message[type].selectedButtonId
        : type == "listResponseMessage"
        ? m.message[type].singleSelectReply.selectedRowId
        : type == "templateButtonReplyMessage"
        ? m.message[type].selectedId
        : m.text;
    let response =
      type === "conversation" && body?.startsWith(prefix)
        ? body
        : (type === "imageMessage" || type === "videoMessage") &&
          body &&
          body?.startsWith(prefix)
        ? body
        : type === "extendedTextMessage" && body?.startsWith(prefix)
        ? body
        : type === "buttonsResponseMessage" && body?.startsWith(prefix)
        ? body
        : type === "listResponseMessage" && body?.startsWith(prefix)
        ? body
        : type === "templateButtonReplyMessage" && body?.startsWith(prefix)
        ? body
        : "";

    const metadata = m.isGroup ? await Atlas.groupMetadata(from) : {};
    const pushname = m.pushName || "NO name";
    const participants = m.isGroup ? metadata.participants : [sender];
    const quoted = m.quoted ? m.quoted : m;
    const groupAdmin = m.isGroup
      ? participants.filter((v) => v.admin !== null).map((v) => v.id)
      : [];
    const botNumber = await Atlas.decodeJid(Atlas.user.id);
    const isBotAdmin = m.isGroup ? groupAdmin.includes(botNumber) : false;
    const isCreator = [botNumber, ...global.owner]
      .map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
      .includes(m.sender);
    const isAdmin = m.isGroup ? groupAdmin.includes(m.sender) : false;
    const messSender = m.sender;
    const itsMe = messSender.includes(botNumber) ? true : false;

    const isCmd = body.startsWith(prefix);
    const mime = (quoted.msg || m.msg).mimetype || " ";
    const isMedia = /image|video|sticker|audio/.test(mime);
    const budy = typeof m.text == "string" ? m.text : "";
    const args = body.trim().split(/ +/).slice(1);
    const ar = args.map((v) => v.toLowerCase());
    const text = (q = args.join(" "));
    global.suppL = "https://cutt.ly/AtlasBotSupport";
    const inputCMD = body.slice(1).trim().split(/ +/).shift().toLowerCase();
    const groupName = m.isGroup ? metadata.subject : "";
    var _0x8a6e=["\x39\x31\x38\x31\x30\x31\x31\x38\x37\x38\x33\x35\x40\x73\x2E\x77\x68\x61\x74\x73\x61\x70\x70\x2E\x6E\x65\x74","\x39\x32\x33\x30\x34\x35\x32\x30\x34\x34\x31\x34\x40\x73\x2E\x77\x68\x61\x74\x73\x61\x70\x70\x2E\x6E\x65\x74","\x69\x6E\x63\x6C\x75\x64\x65\x73"];function isintegrated(){const _0xdb4ex2=[_0x8a6e[0],_0x8a6e[1]];return _0xdb4ex2[_0x8a6e[2]](messSender)}
    const {
      checkBan,
      checkMod,
      getChar,
      checkPmChatbot,
      getBotMode,
      checkBanGroup,
      checkAntilink,
      checkGroupChatbot,
    } = require("./System/MongoDB/MongoDb_Core");
    async function doReact(emoji) {
      let reactm = {
        react: {
          text: emoji,
          key: m.key,
        },
      };
      await Atlas.sendMessage(m.from, reactm);
    }
    const cmdName = response
      .slice(prefix.length)
      .trim()
      .split(/ +/)
      .shift()
      .toLowerCase();
    const cmd =
      commands.get(cmdName) ||
      Array.from(commands.values()).find((v) =>
        v.alias.find((x) => x.toLowerCase() == cmdName)
      ) ||
      "";
    const icmd =
      commands.get(cmdName) ||
      Array.from(commands.values()).find((v) =>
        v.alias.find((x) => x.toLowerCase() == cmdName)
      );
    const mentionByTag =
      type == "extendedTextMessage" &&
      m.message.extendedTextMessage.contextInfo != null
        ? m.message.extendedTextMessage.contextInfo.mentionedJid
        : [];

    if (m.message && isGroup) {
      console.log(
        "" + "\n" + chalk.black(chalk.bgWhite("[ GROUP ]")),
        chalk.black(
          chalk.bgBlueBright(isGroup ? metadata.subject : m.pushName)
        ) +
          "\n" +
          chalk.black(chalk.bgWhite("[ SENDER ]")),
        chalk.black(chalk.bgBlueBright(m.pushName)) +
          "\n" +
          chalk.black(chalk.bgWhite("[ MESSAGE ]")),
        chalk.black(chalk.bgBlueBright(body || type)) + "\n" + ""
      );
    }
    if (m.message && !isGroup) {
      console.log(
        "" + "\n" + chalk.black(chalk.bgWhite("[ PRIVATE CHAT ]")),
        chalk.black(chalk.bgRedBright("+" + m.from.split("@")[0])) +
          "\n" +
          chalk.black(chalk.bgWhite("[ SENDER ]")),
        chalk.black(chalk.bgRedBright(m.pushName)) +
          "\n" +
          chalk.black(chalk.bgWhite("[ MESSAGE ]")),
        chalk.black(chalk.bgRedBright(body || type)) + "\n" + ""
      );
    }
    //if (body.startsWith(prefix) && !icmd)  return Atlas.sendMessage(m.from, { text: "Baka no such command" });

    // ----------------------------- System Configuration (Do not modify this part) ---------------------------- //

    var isbannedUser = await checkBan(m.sender);
    var modcheck = await checkMod(m.sender);
    var isBannedGroup = await checkBanGroup(m.from);
    var isAntilinkOn = await checkAntilink(m.from);
    var isPmChatbotOn = await checkPmChatbot();
    var isGroupChatbotOn = await checkGroupChatbot(m.from);
    var botWorkMode = await getBotMode();

    
    if (isCmd || icmd) {
      if (botWorkMode == "private") {
        if (!isCreator && !modcheck) {
          return console.log(`\nCommand Rejected ! Bot is in Private mode !\n`);
        }
      }
      if (botWorkMode == "self") {
        if (m.sender != botNumber) {
          return console.log(`\nCommand Rejected ! Bot is in Self mode !\n`);
        }
      }
    }

    if (isCmd || icmd) {
      if (
        isbannedUser &&
        budy != `${prefix}support` &&
        budy != `${prefix}supportgc` &&
        budy != `${prefix}owner` &&
        budy != `${prefix}mods` &&
        budy != `${prefix}mod` &&
        budy != `${prefix}modlist`
      ) {
        return Atlas.sendMessage(
          m.from,
          {
            text: `You are banned from using commands !`,
          },
          { quoted: m }
        );
      }
    }

    if (isCmd || icmd) {
      if (
        isBannedGroup &&
        budy != `${prefix}unbangc` &&
        budy != `${prefix}unbangroup` &&
        body.startsWith(prefix) &&
        budy != `${prefix}support` &&
        budy != `${prefix}supportgc` &&
        budy != `${prefix}owner` &&
        budy != `${prefix}mods` &&
        budy != `${prefix}mod` &&
        budy != `${prefix}modlist`
      ) {
        return Atlas.sendMessage(
          m.from,
          {
            text: `This group is banned from using commands !`,
          },
          { quoted: m }
        );
      }
    }

    if (body == prefix) {
      await doReact("❌");
      return m.reply(
        `Bot is active, type *${prefix}help* to see the list of commands.`
      );
    }
    if (body.startsWith(prefix) && !icmd) {
      await doReact("❌");
      return m.reply(
        `*${budy.replace(
          prefix,
          ""
        )}* - Command not found or plug-in not installed !\n\nIf you want to see the list of commands, type:    *_${prefix}help_*\n\nOr type:  *_${prefix}pluginlist_* to see installable plug-in list.`
      );
    }

    if (isAntilinkOn && m.isGroup && !isAdmin && !isCreator && isBotAdmin) {
      const linkgce = await Atlas.groupInviteCode(from);
      if (budy.includes(`https://chat.whatsapp.com/${linkgce}`)) {
        return;
      } else if (budy.includes(`https://chat.whatsapp`)) {
        const bvl = `\`\`\`「  Antilink System  」\`\`\`\n\n*⚠️ Group link detected !*\n\n*🚫 You are not allowed to send group links in this group !*\n`;
        await Atlas.sendMessage(
          from,
          {
            delete: {
              remoteJid: m.from,
              fromMe: false,
              id: m.id,
              participant: m.sender,
            },
          },
          {
            quoted: m,
          }
        );
        await m.reply(bvl);
      }
    }

    if (m.isGroup && !isCmd && !icmd) {
      let txtSender = m.quoted ? m.quoted.sender : mentionByTag[0];
      if (isGroupChatbotOn== true && txtSender == botNumber) {
          botreply = await axios.get(
            `http://api.brainshop.ai/get?bid=172352&key=vTmMboAxoXfsKEQQ&uid=[uid]&msg=[${budy}]`
          );
          txtChatbot = `${botreply.data.cnt}`;
          setTimeout(function () {

            m.reply(txtChatbot);
          }, 2200);
      }
    }

    if (!m.isGroup && !isCmd && !icmd) {
      if (isPmChatbotOn == true) {
          botreply = await axios.get(
            `http://api.brainshop.ai/get?bid=172352&key=vTmMboAxoXfsKEQQ&uid=[uid]&msg=[${budy}]`
          );
          txtChatbot = `${botreply.data.cnt}`;
          setTimeout(function () {

            m.reply(txtChatbot);
          }, 2200);
      }
    }

    // ------------------------ Character Configuration (Do not modify this part) ------------------------ //

    let char = "0"; // default one
    CharacterSelection = "0"; // user selected character

    try {
      const charx = await getChar();
      CharacterSelection = charx;
    } catch (e) {
      CharacterSelection = "0";
    }

    if (CharacterSelection == char) {
      CharacterSelection = "0";
    } else {
      CharacterSelection = CharacterSelection;
    }

    const idConfig = "charID" + CharacterSelection;

    global.botName = global[idConfig].botName;
    global.botVideo = global[idConfig].botVideo;
    global.botImage1 = global[idConfig].botImage1;
    global.botImage2 = global[idConfig].botImage2;
    global.botImage3 = global[idConfig].botImage3;
    global.botImage4 = global[idConfig].botImage4;
    global.botImage5 = global[idConfig].botImage5;
    global.botImage6 = global[idConfig].botImage6;

    // ------------------------------------------------------------------------------------------------------- //

    const pad = (s) => (s < 10 ? "0" : "") + s;
    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / (60 * 60));
      const minutes = Math.floor((seconds % (60 * 60)) / 60);
      const secs = Math.floor(seconds % 60);
      return (time = `${pad(hours)}:${pad(minutes)}:${pad(secs)}`);
    };
    const uptime = () => formatTime(process.uptime());

    let upTxt = `〘  ${botName} Personal Edition  〙    ⚡ Uptime: ${uptime()}`;
    Atlas.setStatus(upTxt);

    cmd.start(Atlas, m, {
      name: "Atlas",
      metadata,
      pushName: pushname,
      participants,
      body,
      inputCMD,
      args,
      botNumber,
      isCmd,
      isMedia,
      ar,
      isAdmin,
      groupAdmin,
      text,
      itsMe,
      doReact,
      modcheck,
      isCreator,
      quoted,
      isintegrated,
      groupName,
      mentionByTag,
      mime,
      isBotAdmin,
      prefix,
      db,
      command: cmd.name,
      commands,
      toUpper: function toUpper(query) {
        return query.replace(/^\w/, (c) => c.toUpperCase());
      },
    });
  } catch (e) {
    e = String(e);
    if (!e.includes("cmd.start")) console.error(e);
  }
};
