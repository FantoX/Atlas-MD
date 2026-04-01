import "./Configurations.js";
import {
  makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadContentFromMessage,
  jidDecode,
} from "@whiskeysockets/baileys";
import MongoAuth from "./System/MongoAuth/MongoAuth.js";
import fs from "fs";
import figlet from "figlet";
import * as FileType from "file-type";
import fs from "fs";
import got from "got";
import path, { dirname, join } from "path";
import pino from "pino";
import path from "path";
import { fileTypeFromBuffer } from "file-type";
import { Boom } from "@hapi/boom";
import { serialize, WAConnection } from "./System/whatsapp.js";
import { smsg, getBuffer, getSizeMedia } from "./System/Function2.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import express from "express";
import mongoose from "mongoose";
import qrcode from "qrcode";
import qrcodeTerminal from "qrcode-terminal";
import { getPluginURLs } from "./System/MongoDB/MongoDb_Core.js";
import chalk from "chalk";

// Minimal in-memory store — makeInMemoryStore was removed in Baileys v7
const store = {
  contacts: {},
  messages: {},
  bind(ev) {
    ev.on("contacts.upsert", (contacts) => {
      for (const contact of contacts) {
        store.contacts[contact.id] = contact;
      }
    });
    ev.on("contacts.update", (updates) => {
      for (const update of updates) {
        if (store.contacts[update.id])
          Object.assign(store.contacts[update.id], update);
        else store.contacts[update.id] = update;
      }
    });
    ev.on("messages.upsert", ({ messages }) => {
      for (const msg of messages) {
        if (!msg.key?.remoteJid || !msg.key?.id) continue;
        const jid = msg.key.remoteJid;
        if (!store.messages[jid]) store.messages[jid] = {};
        store.messages[jid][msg.key.id] = msg;
      }
    });
  },
  loadMessage: async (jid, id) => store.messages[jid]?.[id],
};

// Atlas Server configuration
let QR_GENERATE = "invalid";
let status;
let mongoAuth; // module-level so the GC/sync interval can access it

const startAtlas = async () => {
  try {
    await mongoose.connect(mongodb).then(() => {
      console.log(
        chalk.greenBright("Establishing secure connection with MongoDB...\n"),
      );
    });
  } catch (err) {
    console.log(
      chalk.redBright(
        "Error connecting to MongoDB ! Please check MongoDB URL or try again after some minutes !\n",
      ),
    );
    console.log(err);
  }
  mongoAuth = new MongoAuth(sessionId);
  const { state, saveCreds, clearState } = await mongoAuth.init();
  console.log(
    figlet.textSync("ATLAS", {
      font: "Standard",
      horizontalLayout: "default",
      vertivalLayout: "default",
      width: 70,
      whitespaceBreak: true,
    }),
  );
  console.log(`\n`);

  await installPlugin();

  const { version, isLatest } = await fetchLatestBaileysVersion();

  const Atlas = makeWASocket({
    logger: pino({ level: "silent" }),
    browser: ["Atlas", "Safari", "1.0.0"],
    auth: state,
    version,
    getMessage: async (key) => {
      if (key.remoteJid === "status@broadcast") return {};
      return store.loadMessage(key.remoteJid, key.id);
    },
  });

  store.bind(Atlas.ev);

  Atlas.public = true;

  async function installPlugin() {
    console.log(chalk.yellow("Checking for Plugins...\n"));
    let plugins = [];
    try {
      plugins = await getPluginURLs();
    } catch (err) {
      console.log(
        chalk.redBright(
          "Error connecting to MongoDB ! Please re-check MongoDB URL or try again after some minutes !\n",
        ),
      );
      console.log(err);
    }

    if (!plugins.length || plugins.length == 0) {
      console.log(
        chalk.redBright("No Extra Plugins Installed ! Starting Atlas...\n"),
      );
    } else {
      console.log(
        chalk.greenBright(plugins.length + " Plugins found ! Installing...\n"),
      );
      for (let i = 0; i < plugins.length; i++) {
        const pluginUrl = plugins[i];
        try {
          const { body, statusCode } = await got(pluginUrl);
          if (statusCode == 200) {
            const folderName = "Plugins";
            const fileName = path.basename(pluginUrl);
            const filePath = path.join(folderName, fileName);
            fs.writeFileSync(filePath, body);
          } else {
            console.log(
              chalk.yellow(
                `[ ATLAS ] Plugin download returned status ${statusCode}: ${pluginUrl}`,
              ),
            );
          }
        } catch (error) {
          console.log(
            chalk.redBright(
              `[ ATLAS ] Failed to install plugin from ${pluginUrl}: ${error.message}`,
            ),
          );
        }
      }
      console.log(
        chalk.greenBright(
          "All Plugins Installed Successfully ! Starting Atlas...\n",
        ),
      );
    }
  }

  await readcommands();

  Atlas.ev.on("creds.update", saveCreds);
  Atlas.serializeM = (m) => smsg(Atlas, m, store);
  Atlas.ev.on("connection.update", async (update) => {
    const { lastDisconnect, connection, qr } = update;
    if (connection) {
      console.info(`[ ATLAS ] Server Status => ${connection}`);
    }

    if (connection === "close") {
      let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      if (reason === DisconnectReason.badSession) {
        console.log(
          `[ ATLAS ] Bad Session File, Please Delete Session and Scan Again.\n`,
        );
        await clearState();
        process.exit();
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log("[ ATLAS ] Connection closed, reconnecting....\n");
        startAtlas();
      } else if (reason === DisconnectReason.connectionLost) {
        console.log("[ ATLAS ] Connection Lost from Server, reconnecting...\n");
        startAtlas();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(
          "[ ATLAS ] Connection Replaced, Another New Session Opened, Please Close Current Session First!\n",
        );
        process.exit();
      } else if (reason === DisconnectReason.loggedOut) {
        await clearState();
        console.log(
          `[ ATLAS ] Device Logged Out, Please Delete Session and Scan Again.\n`,
        );
        process.exit();
      } else if (reason === DisconnectReason.restartRequired) {
        console.log("[ ATLAS ] Server Restarting...\n");
        startAtlas();
      } else if (reason === DisconnectReason.timedOut) {
        console.log("[ ATLAS ] Connection Timed Out, Trying to Reconnect...\n");
        startAtlas();
      } else {
        console.log(
          `[ ATLAS ] Server Disconnected: "It's either safe disconnect or WhatsApp Account got banned !\n"`,
        );
      }
    }
    if (qr) {
      QR_GENERATE = qr;
      qrcodeTerminal.generate(qr, { small: true });
    }
  });

  Atlas.ev.on("group-participants.update", async (m) => {
    welcomeLeft(Atlas, m);
  });

  Atlas.ev.on("messages.upsert", async (chatUpdate) => {
    if (chatUpdate.type !== "notify") return;
    const msg = chatUpdate.messages?.[0];
    if (!msg) return;
    const m = serialize(Atlas, msg);

    if (!m?.message) return;
    if (m.key?.remoteJid === "status@broadcast") return;
    if (m.key?.id?.startsWith("BAE5") && m.key.id.length === 16) return;

    core(Atlas, m, commands, chatUpdate);
  });

  Atlas.getName = (jid, withoutContact = false) => {
    let id = Atlas.decodeJid(jid);
    withoutContact = Atlas.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us"))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {};
        if (!(v.name || v.subject)) v = Atlas.groupMetadata(id) || {};
        resolve(
          v.name ||
            v.subject ||
            PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber(
              "international",
            ),
        );
      });
    else
      v =
        id === "0@s.whatsapp.net"
          ? {
              id,
              name: "WhatsApp",
            }
          : id === Atlas.decodeJid(Atlas.user.id)
            ? Atlas.user
            : store.contacts[id] || {};
    return (
      (withoutContact ? "" : v.name) ||
      v.subject ||
      v.verifiedName ||
      PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber(
        "international",
      )
    );
  };

  Atlas.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    } else return jid;
  };

  Atlas.ev.on("contacts.update", (update) => {
    for (let contact of update) {
      let id = Atlas.decodeJid(contact.id);
      if (store && store.contacts)
        store.contacts[id] = {
          id,
          name: contact.notify,
        };
    }
  });

  Atlas.downloadAndSaveMediaMessage = async (
    message,
    filename,
    attachExtension = true,
  ) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await fileTypeFromBuffer(buffer);
    const trueFileName = attachExtension ? filename + "." + type.ext : filename;
    await fs.promises.writeFile(trueFileName, buffer);
    return trueFileName;
  };

  Atlas.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    return buffer;
  };

  Atlas.parseMention = async (text) => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
      (v) => v[1] + "@s.whatsapp.net",
    );
  };

  Atlas.sendText = (jid, text, quoted = "", options) =>
    Atlas.sendMessage(
      jid,
      {
        text: text,
        ...options,
      },
      {
        quoted,
      },
    );

  Atlas.getFile = async (PATH, save) => {
    let res;
    let data = Buffer.isBuffer(PATH)
      ? PATH
      : /^data:.*?\/.*?;base64,/i.test(PATH)
        ? Buffer.from(PATH.split`,`[1], "base64")
        : /^https?:\/\//.test(PATH)
          ? await (res = await getBuffer(PATH))
          : fs.existsSync(PATH)
            ? ((filename = PATH), fs.readFileSync(PATH))
            : typeof PATH === "string"
              ? PATH
              : Buffer.alloc(0);

    let type = (await fileTypeFromBuffer(data)) || {
      mime: "application/octet-stream",
      ext: ".bin",
    };
    let filename = path.join(
      __filename,
      "../src/" + new Date() * 1 + "." + type.ext,
    );
    if (data && save) await fs.promises.writeFile(filename, data);
    return {
      res,
      filename,
      size: await getSizeMedia(data),
      ...type,
      data,
    };
  };

  Atlas.setStatus = (status) => {
    // v7: query() removed — use updateProfileStatus instead (fire-and-forget)
    Atlas.updateProfileStatus(status).catch(() => {});
    return status;
  };

  Atlas.sendFile = async (jid, PATH, fileName, quoted = {}, options = {}) => {
    let types = await Atlas.getFile(PATH, true);
    let { filename, size, ext, mime, data } = types;
    let type = "",
      mimetype = mime,
      pathFile = filename;
    if (options.asDocument) type = "document";
    if (options.asSticker || /webp/.test(mime)) {
      const { writeExif } = await import("./lib/sticker.js");
      let media = {
        mimetype: mime,
        data,
      };
      pathFile = await writeExif(media, {
        packname: global.packname,
        author: global.packname,
        categories: options.categories ? options.categories : [],
      });
      await fs.promises.unlink(filename);
      type = "sticker";
      mimetype = "image/webp";
    } else if (/image/.test(mime)) type = "image";
    else if (/video/.test(mime)) type = "video";
    else if (/audio/.test(mime)) type = "audio";
    else type = "document";
    await Atlas.sendMessage(
      jid,
      {
        [type]: {
          url: pathFile,
        },
        mimetype,
        fileName,
        ...options,
      },
      {
        quoted,
        ...options,
      },
    );
    return fs.promises.unlink(pathFile);
  };
};

startAtlas();

// Dynamic garbage collection — interval configurable via GC_INTERVAL_MINUTES env (default: 30)
const GC_INTERVAL_MINUTES = Math.max(
  1,
  parseInt(process.env.GC_INTERVAL_MINUTES || "30", 10),
);
// Periodic MongoDB session sync — runs at the same interval as GC
const runPeriodicSync = async () => {
  if (mongoAuth) {
    await mongoAuth.pushToMongoDB().catch((err) =>
      console.error(chalk.redBright(`[ ATLAS ] MongoDB session sync error: ${err.message}`)),
    );
    console.log(chalk.cyan(`[ ATLAS ] Session synced to MongoDB`));
  }
};

if (typeof global.gc === "function") {
  setInterval(
    async () => {
      global.gc();
      console.log(
        chalk.cyan(
          `[ ATLAS ] Garbage collection triggered (interval: ${GC_INTERVAL_MINUTES}m)`,
        ),
      );
      await runPeriodicSync();
    },
    GC_INTERVAL_MINUTES * 60 * 1000,
  );
  console.log(
    chalk.cyan(
      `[ ATLAS ] GC scheduler active — running every ${GC_INTERVAL_MINUTES} minute(s)`,
    ),
  );
} else {
  console.warn(
    "[ ATLAS ] GC not available. Start the bot with 'npm start' to enable garbage collection.",
  );
  // Still run session sync even without GC
  setInterval(runPeriodicSync, GC_INTERVAL_MINUTES * 60 * 1000);
}

app.use("/", express.static(join(__dirname, "Frontend")));

app.get("/qr", async (req, res) => {
  const { session } = req.query;
  if (!session)
    return void res
      .status(404)
      .setHeader("Content-Type", "text/plain")
      .send("Please Provide the session ID that you set for authentication !")
      .end();
  if (sessionId !== session)
    return void res
      .status(404)
      .setHeader("Content-Type", "text/plain")
      .send("Invalid session ID ! Please check your session ID !")
      .end();
  if (status == "open")
    return void res
      .status(404)
      .setHeader("Content-Type", "text/plain")
      .send("Session is already in use !")
      .end();
  res.setHeader("content-type", "image/png");
  res.send(await qrcode.toBuffer(QR_GENERATE));
});

app.listen(PORT);
