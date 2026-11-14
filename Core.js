import "./Configurations.js";
import "./System/BotCharacters.js";
import chalk from "chalk";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { getGeminiConfig, GEMINI_MODEL } from "./System/__system_prompt.js";
import { QuickDB, JSONDriver } from "quick.db";
import Levels from "discord-xp";
import {
  checkBan,
  checkMod,
  getChar,
  checkPmChatbot,
  getBotMode,
  checkBanGroup,
  checkAntilink,
  checkGroupChatbot,
} from "./System/MongoDB/MongoDb_Core.js";
const prefix = global.prefa;
global.Levels = Levels;
export default async (KAMI, m, commands, chatUpdate) => {
  try {
    const jsonDriver = new JSONDriver();
    const db = new QuickDB({ driver: jsonDriver });

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
                : type === "templateButtonReplyMessage" &&
                    body?.startsWith(prefix)
                  ? body
                  : "";

    const metadata = m.isGroup
      ? await KAMI.groupMetadata(from).catch(() => ({}))
      : {};
    const pushname = m.pushName || "NO name";
    const participants = m.isGroup ? metadata.participants || [] : [sender];
    const quoted = m.quoted ? m.quoted : m;
    const sanitize = (jid) => {
      if (!jid) return "";
      return jid.split("@")[0].split(":")[0] + "@" + jid.split("@")[1];
    };
    const botNumber = await KAMI.decodeJid(KAMI.user.id);
    const botIdClean = sanitize(botNumber);
    const botLid = KAMI.user?.lid ? sanitize(KAMI.user.lid) : botIdClean;
    const groupAdmins = m.isGroup
      ? participants
          .filter((p) => p.admin === "admin" || p.admin === "superadmin")
          .map((p) => p.id)
      : [];
    const isBotAdmin = m.isGroup
      ? groupAdmins.includes(botIdClean) ||
        groupAdmins.includes(botLid) ||
        groupAdmins.some((admin) => sanitize(admin) === botIdClean)
      : false;
    const isAdmin = m.isGroup
      ? groupAdmins.includes(m.sender) ||
        groupAdmins.includes(sanitize(m.sender))
      : false;
    // Baileys v7 LID resolution: m.sender is a LID (@lid).
    // The phone JID is available from:
    //   1. m.key.participantAlt (set by Baileys on every group message)
    //   2. participant.phoneNumber (in group metadata)
    //   3. KAMI.user.id (if sender is the bot itself)
    let resolvedSender = m.sender;
    if (m.sender.endsWith("@lid")) {
      // 1. Check cached LID→phone mapping first
      const cached = global.lidToJidMap?.get(sanitize(m.sender));
      if (cached && cached.endsWith("@s.whatsapp.net")) {
        resolvedSender = cached;
      } else if (m.key?.participantAlt?.endsWith("@s.whatsapp.net")) {
        // 2. Baileys v7 participantAlt field
        resolvedSender = sanitize(m.key.participantAlt);
      } else if (m.isGroup) {
        // 3. Group metadata phone number
        const pMatch = participants.find(
          (p) => sanitize(p.id) === sanitize(m.sender) && p.phoneNumber
        );
        if (pMatch) resolvedSender = sanitize(pMatch.phoneNumber);
      }
      // 4. Bot self-check
      if (resolvedSender === m.sender && sanitize(m.sender) === botLid) {
        resolvedSender = botIdClean;
      }
      // Cache for future lookups
      if (resolvedSender !== m.sender) {
        global.lidToJidMap.set(sanitize(m.sender), resolvedSender);
      }
    }
    const ownerDigits = new Set(
      [botIdClean, ...global.owner].map((v) => v.replace(/[^0-9]/g, ""))
    );
    const isCreator =
      ownerDigits.has(resolvedSender.replace(/[^0-9]/g, "")) ||
      ownerDigits.has(m.sender.replace(/[^0-9]/g, ""));
    const messSender = m.sender;
    const itsMe = m.sender.includes(botIdClean.split("@")[0]);
    const groupAdmin = groupAdmins;

    const isCmd = body.startsWith(prefix);
    const mime = (quoted.msg || m.msg).mimetype || " ";
    const isMedia = /image|video|sticker|audio/.test(mime);
    const budy = typeof m.text == "string" ? m.text : "";
    const args = body.trim().split(/ +/).slice(1);
    const ar = args.map((v) => v.toLowerCase());
    const text = args.join(" ");
    global.suppL = "";
    const inputCMD = body.slice(1).trim().split(/ +/).shift().toLowerCase();
    const groupName = m.isGroup ? metadata.subject : "";
    // No developer backdoor or hard-coded privileged accounts.
    function isintegrated() { return false; }
    async function doReact(emoji) {
      let reactm = {
        react: {
          text: emoji,
          key: m.key,
        },
      };
      await KAMI.sendMessage(m.from, reactm);
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
        v.alias.find((x) => x.toLowerCase() == cmdName),
      ) ||
      "";
    const icmd =
      commands.get(cmdName) ||
      Array.from(commands.values()).find((v) =>
        v.alias.find((x) => x.toLowerCase() == cmdName),
      );
    const mentionByTag =
      type == "extendedTextMessage" &&
      m.message.extendedTextMessage.contextInfo != null
        ? m.message.extendedTextMessage.contextInfo.mentionedJid
        : [];

    const timeNow = new Date().toLocaleTimeString();
    const dateNow = new Date().toLocaleDateString();
    const timePrefix = chalk.black(chalk.bgCyan(`[ ${dateNow} - ${timeNow} ]`));

    // In Baileys v7, JIDs can be LIDs (@lid) instead of phone numbers (@s.whatsapp.net)
    const displayJid = (jid) => {
      if (!jid) return "unknown";
      const [local, domain] = jid.split("@");
      if (domain === "lid") return `LID:${local}`;
      return "+" + local.split(":")[0];
    };

    if (m.message && isGroup) {
      console.log(
        `${timePrefix} ` + chalk.black(chalk.bgWhite("[ GROUP ]")) + " " +
        chalk.black(chalk.bgBlueBright(isGroup ? metadata.subject : m.pushName)) + "\n" +
        `${timePrefix} ` + chalk.black(chalk.bgWhite("[ SENDER ]")) + " " +
        chalk.black(chalk.bgBlueBright(m.pushName)) + "\n" +
        `${timePrefix} ` + chalk.black(chalk.bgWhite("[ MESSAGE ]")) + " " +
        chalk.black(chalk.bgBlueBright(body || type))
      );
    }
    if (m.message && !isGroup) {
      console.log(
        `${timePrefix} ` + chalk.black(chalk.bgWhite("[ PRIVATE ]")) + " " +
        chalk.black(chalk.bgRedBright(displayJid(m.from))) + "\n" +
        `${timePrefix} ` + chalk.black(chalk.bgWhite("[ SENDER ]")) + " " +
        chalk.black(chalk.bgRedBright(m.pushName)) + "\n" +
        `${timePrefix} ` + chalk.black(chalk.bgWhite("[ MESSAGE ]")) + " " +
        chalk.black(chalk.bgRedBright(body || type))
      );
    }

    // ----------------------------- System Configuration (Do not modify this part) ---------------------------- //

    const isbannedUser = await checkBan(m.sender);
    const modcheck = await checkMod(m.sender);
    const isBannedGroup = await checkBanGroup(m.from);
    const isAntilinkOn = await checkAntilink(m.from);
    const isPmChatbotOn = await checkPmChatbot();
    const isGroupChatbotOn = await checkGroupChatbot(m.from);
    const botWorkMode = await getBotMode();

    if (isCmd || icmd) {
      if (botWorkMode == "private") {
        if (!isCreator && !modcheck) {
          return console.log(`${timePrefix} ` + chalk.black(chalk.bgYellow("[ REJECTED ]")) + " " + chalk.black(chalk.bgYellow(`Private mode — ${m.pushName} (${body})`)));
        }
      }
      if (botWorkMode == "self") {
        if (m.sender != botNumber) {
          return console.log(`${timePrefix} ` + chalk.black(chalk.bgYellow("[ REJECTED ]")) + " " + chalk.black(chalk.bgYellow(`Self mode — ${m.pushName} (${body})`)));
        }
      }
    }

    const infoCommands = ["mods", "modlist", "owner", "owners", "support", "supportgc"];

    if (isCmd || icmd) {
      if (isbannedUser && !isCreator && !modcheck) {
        return; // Silently ignore banned users
      }
    }

    if (isCmd || icmd) {
      if (
        isBannedGroup &&
        budy != `${prefix}unbangc` &&
        budy != `${prefix}unbangroup` &&
        !isCreator && !modcheck && !infoCommands.includes(inputCMD)
      ) {
        return; // Silently ignore in banned groups (except contact/info commands)
      }
    }

    if (body == prefix) {
      await doReact("❌");
      return m.reply(
        `Bot is active, type *${prefix}help* to see the list of commands.`,
      );
    }
    if (body.startsWith(prefix) && !icmd) {
      await doReact("❌");
      return m.reply(
        `*${budy.replace(
          prefix,
          "",
        )}* - Command not found or plug-in not installed !\n\nIf you want to see the list of commands, type:    *_${prefix}help_*\n\nOr type:  *_${prefix}pluginlist_* to see installable plug-in list.`,
      );
    }

    if (isAntilinkOn && m.isGroup && !isAdmin && !isCreator && !modcheck && !isintegrated() && isBotAdmin) {
      // Match any URL (http/https)
      const urlRegex = /https?:\/\/[^\s]+/gi;
      const detectedUrls = budy.match(urlRegex);
      if (detectedUrls && detectedUrls.length > 0) {
        // Allow own group invite link
        let isOwnLink = false;
        try {
          const linkgce = await KAMI.groupInviteCode(from);
          isOwnLink = detectedUrls.every((u) => u.includes(`chat.whatsapp.com/${linkgce}`));
        } catch {}

        if (!isOwnLink) {
          // Track this deletion so anti-delete ignores it
          if (!global.botDeletedMsgIds) global.botDeletedMsgIds = new Set();
          global.botDeletedMsgIds.add(m.id);
          // Auto-cleanup after 5 minutes to prevent memory leak
          setTimeout(() => global.botDeletedMsgIds?.delete(m.id), 300000);

          // Delete the message
          await KAMI.sendMessage(from, {
            delete: {
              remoteJid: m.from,
              fromMe: false,
              id: m.id,
              participant: m.sender,
            },
          });
          const bvl = `\`\`\`「  Antilink System  」\`\`\`\n\n*⚠️ Link detected !*\n\n*🚫 @${m.sender.split("@")[0]}, you are not allowed to send links in this group !*\n`;
          await KAMI.sendMessage(from, { text: bvl, mentions: [m.sender] }, { quoted: m });
        }
      }
    }

    const fetchGeminiReply = async (promptText) => {
      // AI responses use only the operator-configured Gemini API key.
      const geminiKey = global.pickKey(global.geminiAPIKeys);
      let responseText = null;

      if (geminiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey: geminiKey });
          const result = await ai.models.generateContent({
            model: GEMINI_MODEL,
            config: getGeminiConfig(),
            contents: [{ role: "user", parts: [{ text: promptText }] }],
          });
          responseText = result.text;
        } catch (err) {
          console.error("Configured Gemini API request failed:", err.message || err);
        }
      } else {
        console.log("No Gemini API key configured; chatbot is unavailable.");
      }
      return responseText ? responseText.trim() : "Service unavailable at the moment.";
    };

    if (m.isGroup && !isCmd && !icmd) {
      let txtSender = m.quoted ? m.quoted.sender : mentionByTag[0];
      const senderClean = sanitize(txtSender);
      const isBotMentioned = txtSender && (
        senderClean === botIdClean ||
        senderClean === botLid ||
        txtSender === botNumber
      );
      if (isGroupChatbotOn == true && isBotMentioned) {
        try {
          await KAMI.sendPresenceUpdate('composing', m.from);
          const txtChatbot = await fetchGeminiReply(budy);
          m.reply(txtChatbot);
          await KAMI.sendPresenceUpdate('paused', m.from);
        } catch (e) {
          console.error("[ KAMI ] Group chatbot error:", e.message);
        }
      }
    }

    if (!m.isGroup && !isCmd && !icmd) {
      if (isPmChatbotOn == true) {
        try {
          await KAMI.sendPresenceUpdate('composing', m.from);
          const txtChatbot = await fetchGeminiReply(budy);
          m.reply(txtChatbot);
          await KAMI.sendPresenceUpdate('paused', m.from);
        } catch (e) {
          console.error("[ KAMI ] PM chatbot error:", e.message);
        }
      }
    }

    // ------------------------ Character Configuration (Do not modify this part) ------------------------ //

    const char = "0"; // default one
    let CharacterSelection = "0"; // user selected character

    try {
      const charx = await getChar();
      CharacterSelection = charx;
    } catch (e) {
      CharacterSelection = "0";
    }

    if (CharacterSelection == char) {
      CharacterSelection = "0";
    }

    const idConfig = "charID" + CharacterSelection;
    const charConfig = global[idConfig] || global["charID0"];

    global.botName = charConfig.botName;
    global.botVideo = charConfig.botVideo;
    global.botImage1 = charConfig.botImage1;
    global.botImage2 = charConfig.botImage2;
    global.botImage3 = charConfig.botImage3;
    global.botImage4 = charConfig.botImage4;
    global.botImage5 = charConfig.botImage5;
    global.botImage6 = charConfig.botImage6;

    // ------------------------------------------------------------------------------------------------------- //

    const pad = (s) => (s < 10 ? "0" : "") + s;
    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / (60 * 60));
      const minutes = Math.floor((seconds % (60 * 60)) / 60);
      const secs = Math.floor(seconds % 60);
      return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    };
    const uptime = () => formatTime(process.uptime());

    let upTxt = `〘  ${botName} Personal Edition  〙    ⚡ Uptime: ${uptime()}`;
    KAMI.setStatus(upTxt);

    cmd.start(KAMI, m, {
      name: "KAMI",
      metadata,
      pushName: pushname,
      participants,
      body,
      inputCMD,
      args,
      botNumber,
      botLid,
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
