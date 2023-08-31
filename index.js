require("./Configurations");
const {
  default: atlasConnect,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadContentFromMessage,
  makeInMemoryStore,
  jidDecode,
} = require("baileysjs");
const fs = require("fs");
const figlet = require("figlet");
const { join } = require("path");
const got = require("got");
const pino = require("pino");
const path = require("path");
const FileType = require("file-type");
const { Boom } = require("@hapi/boom");
const { serialize, WAConnection } = require("./System/whatsapp.js");
const { smsg, getBuffer, getSizeMedia } = require("./System/Function2");
const express = require("express");
const app = express();
const PORT = global.port;
const welcomeLeft = require("./System/Welcome.js");
const { readcommands, commands } = require("./System/ReadCommands.js");
commands.prefix = global.prefa;
const mongoose = require("mongoose");
const Auth = require("./System/MongoAuth/MongoAuth");
const qrcode = require("qrcode");
const {
  getPluginURLs, // -------------------- GET ALL PLUGIN DATA FROM DATABASE
} = require("./System/MongoDB/MongoDb_Core.js");

const chalk = require("chalk");
const store = makeInMemoryStore({
  logger: pino().child({
    level: "silent",
    stream: "store",
  }),
});

// Atlas Server configuration
let QR_GENERATE = "invalid";
let status;
const startAtlas = async () => {
  try {
    await mongoose.connect(mongodb).then(() => {
      console.log(
        chalk.greenBright("Establishing secure connection with MongoDB...\n")
      );
    });
  } catch (err) {
    console.log(
      chalk.redBright(
        "Error connecting to MongoDB ! Please check MongoDB URL or try again after some minutes !\n"
      )
    );
    console.log(err);
  }
  const { getAuthFromDatabase } = new Auth(sessionId);

  const { saveState, state, clearState } = await getAuthFromDatabase();
  console.log(
    figlet.textSync("ATLAS", {
      font: "Standard",
      horizontalLayout: "default",
      vertivalLayout: "default",
      width: 70,
      whitespaceBreak: true,
    })
  );
  console.log(`\n`);

  await installPlugin();

  const { version, isLatest } = await fetchLatestBaileysVersion();

  const Atlas = atlasConnect({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    browser: ["Atlas", "Safari", "1.0.0"],
    auth: state,
    version,
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
          "Error connecting to MongoDB ! Please re-check MongoDB URL or try again after some minutes !\n"
        )
      );
      console.log(err);
    }

    if (!plugins.length || plugins.length == 0) {
      console.log(
        chalk.redBright("No Extra Plugins Installed ! Starting Atlas...\n")
      );
    } else {
      console.log(
        chalk.greenBright(plugins.length + " Plugins found ! Installing...\n")
      );
      for (let i = 0; i < plugins.length; i++) {
        pluginUrl = plugins[i];
        var { body, statusCode } = await got(pluginUrl);
        if (statusCode == 200) {
          try {
            var folderName = "Plugins";
            var fileName = path.basename(pluginUrl);

            var filePath = path.join(folderName, fileName);
            fs.writeFileSync(filePath, body);
          } catch (error) {
            console.log("Error:", error);
          }
        }
      }
      console.log(
        chalk.greenBright(
          "All Plugins Installed Successfully ! Starting Atlas...\n"
        )
      );
    }
  }

  await readcommands();

  Atlas.ev.on("creds.update", saveState);
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
          `[ ATLAS ] Bad Session File, Please Delete Session and Scan Again.\n`
        );
        process.exit();
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log("[ ATLAS ] Connection closed, reconnecting....\n");
        startAtlas();
      } else if (reason === DisconnectReason.connectionLost) {
        console.log("[ ATLAS ] Connection Lost from Server, reconnecting...\n");
        startAtlas();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(
          "[ ATLAS ] Connection Replaced, Another New Session Opened, Please Close Current Session First!\n"
        );
        process.exit();
      } else if (reason === DisconnectReason.loggedOut) {
        clearState();
        console.log(
          `[ ATLAS ] Device Logged Out, Please Delete Session and Scan Again.\n`
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
          `[ ATLAS ] Server Disconnected: "It's either safe disconnect or WhatsApp Account got banned !\n"`
        );
      }
    }
    if (qr) {
      QR_GENERATE = qr;
    }
  });

  Atlas.ev.on("group-participants.update", async (m) => {
    welcomeLeft(Atlas, m);
  });

  Atlas.ev.on("messages.upsert", async (chatUpdate) => {
    m = serialize(Atlas, chatUpdate.messages[0]);

    if (!m.message) return;
    if (m.key && m.key.remoteJid == "status@broadcast") return;
    if (m.key.id.startsWith("BAE5") && m.key.id.length == 16) return;

    require("./Core.js")(Atlas, m, commands, chatUpdate);
  });

  Atlas.getName = (jid, withoutContact = false) => {
    id = Atlas.decodeJid(jid);
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
              "international"
            )
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
        "international"
      )
    );
  };

  Atlas.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (
        (decode.user && decode.server && decode.user + "@" + decode.server) ||
        jid
      );
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
    attachExtension = true
  ) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype
      ? message.mtype.replace(/Message/gi, "")
      : mime.split("/")[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await FileType.fromBuffer(buffer);
    trueFileName = attachExtension ? filename + "." + type.ext : filename;
    // save to file
    await fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
  };

  Atlas.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype
      ? message.mtype.replace(/Message/gi, "")
      : mime.split("/")[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    return buffer;
  };

  Atlas.parseMention = async (text) => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
      (v) => v[1] + "@s.whatsapp.net"
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
      }
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

    let type = (await FileType.fromBuffer(data)) || {
      mime: "application/octet-stream",
      ext: ".bin",
    };
    filename = path.join(
      __filename,
      "../src/" + new Date() * 1 + "." + type.ext
    );
    if (data && save) fs.promises.writeFile(filename, data);
    return {
      res,
      filename,
      size: await getSizeMedia(data),
      ...type,
      data,
    };
  };

  Atlas.setStatus = (status) => {
    Atlas.query({
      tag: "iq",
      attrs: {
        to: "@s.whatsapp.net",
        type: "set",
        xmlns: "status",
      },
      content: [
        {
          tag: "status",
          attrs: {},
          content: Buffer.from(status, "utf-8"),
        },
      ],
    });
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
      let { writeExif } = require("./lib/sticker.js");
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
      }
    );
    return fs.promises.unlink(pathFile);
  };
};

startAtlas();

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
