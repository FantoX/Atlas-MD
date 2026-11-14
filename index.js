import "./Configurations.js";
import ffmpegStatic from "ffmpeg-static";
process.env.FFMPEG_PATH = ffmpegStatic;
import {
  makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadContentFromMessage,
  downloadMediaMessage,
  jidDecode,
} from "@whiskeysockets/baileys";
import MongoAuth from "./System/MongoAuth/MongoAuth.js";
import fs from "fs";
import figlet from "figlet";
import { join } from "path";
import got from "got";
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

fs.writeFileSync(path.join(__dirname, "kami.pid"), process.pid.toString());

// Map of noise prefixes → clean replacement line printed to stdout once per event
const _BAILEYS_NOISE_MAP = {
  "Failed to decrypt message with any known session":
    "[ KAMI ] Signal: failed to decrypt (session key mismatch — skipped)",
  "Session error:": "[ KAMI ] Signal: session error (Bad MAC — skipped)",
  "Closing open session in favor of incoming prekey bundle":
    "[ KAMI ] Signal: rotating session (new prekey bundle received)",
  "Closing session:": null, // suppress entirely — too verbose (raw key dump)
  "Opening session:": null,
};

const _matchNoise = (str) => {
  for (const [prefix, replacement] of Object.entries(_BAILEYS_NOISE_MAP)) {
    if (str.startsWith(prefix)) return { matched: true, replacement };
  }
  return { matched: false };
};

// Patch console.log (stdout)
const _origLog = console.log;
console.log = (...args) => {
  const first = String(args[0] ?? "");
  const { matched, replacement } = _matchNoise(first);
  if (matched) {
    if (replacement) _origLog(replacement);
    return;
  }
  _origLog(...args);
};

// Patch console.error (stderr) — libsignal uses this path
const _origErr = console.error;
console.error = (...args) => {
  const first = String(args[0] ?? "");
  const { matched, replacement } = _matchNoise(first);
  if (matched) {
    if (replacement) _origLog(replacement); // route clean msg to stdout
    return;
  }
  _origErr(...args);
};

// Patch console.info — libsignal uses console.info("Closing session:", session)
const _origInfo = console.info;
console.info = (...args) => {
  const first = String(args[0] ?? "");
  const { matched, replacement } = _matchNoise(first);
  if (matched) {
    if (replacement) _origLog(replacement);
    return;
  }
  _origInfo(...args);
};

// Patch process.stderr.write — final fallback used by some internal Node streams
const _origStderrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = (chunk, ...rest) => {
  const str = typeof chunk === "string" ? chunk : chunk.toString();
  const { matched, replacement } = _matchNoise(str.trimStart());
  if (matched) {
    if (replacement) _origLog(replacement);
    return true;
  }
  return _origStderrWrite(chunk, ...rest);
};

import express from "express";
const app = express();
const PORT = global.port;
import welcomeLeft from "./System/Welcome.js";
import { readcommands, commands } from "./System/ReadCommands.js";
import core from "./Core.js";
commands.prefix = global.prefa;
import mongoose from "mongoose";
import qrcode from "qrcode";
import qrcodeTerminal from "qrcode-terminal";
import {
  getPluginURLs,
  checkAntidelete,
  checkMod,
} from "./System/MongoDB/MongoDb_Core.js";
import chalk from "chalk";

app.use(express.json());

global.lidToJidMap = new Map();

const MESSAGE_CACHE_TTL_MS =
  Math.max(
    30,
    parseInt(process.env.MESSAGE_CACHE_TTL_MINUTES || "360", 10) || 360,
  ) *
  60 *
  1000;
const MESSAGE_CACHE_MAX_PER_CHAT = Math.max(
  50,
  parseInt(process.env.MESSAGE_CACHE_MAX_PER_CHAT || "500", 10) || 500,
);

const store = {
  contacts: {},
  messages: {},
  messageTimes: {},
  messageQueue: {},
  pruneMessages(now = Date.now()) {
    for (const [jid, queue] of Object.entries(store.messageQueue)) {
      const messages = store.messages[jid];
      const messageTimes = store.messageTimes[jid];
      if (!messages || !messageTimes) {
        delete store.messageQueue[jid];
        delete store.messages[jid];
        delete store.messageTimes[jid];
        continue;
      }

      while (
        queue.length > 0 &&
        (queue.length > MESSAGE_CACHE_MAX_PER_CHAT ||
          now - queue[0].cachedAt > MESSAGE_CACHE_TTL_MS)
      ) {
        const oldest = queue.shift();
        if (messageTimes[oldest.id] === oldest.cachedAt) {
          delete messages[oldest.id];
          delete messageTimes[oldest.id];
        }
      }

      if (queue.length === 0) {
        delete store.messageQueue[jid];
        delete store.messages[jid];
        delete store.messageTimes[jid];
      }
    }
  },
  bind(ev) {
    let _lidLogTimer = null;
    ev.on("contacts.upsert", (contacts) => {
      for (const contact of contacts) {
        store.contacts[contact.id] = contact;
        const phoneJid = contact.id?.endsWith("@s.whatsapp.net")
          ? contact.id
          : null;
        const lidJid = contact.id?.endsWith("@lid")
          ? contact.id
          : contact.lid?.endsWith("@lid")
            ? contact.lid
            : null;
        if (phoneJid && lidJid) {
          global.lidToJidMap.set(lidJid, phoneJid);
          global.lidToJidMap.set(phoneJid, lidJid);
        }
      }
      // Debounce: print one summary line after the batch settles
      clearTimeout(_lidLogTimer);
      _lidLogTimer = setTimeout(() => {
        if (global.lidToJidMap.size > 0)
          _origLog(
            `[ KAMI ] LID map ready: ${global.lidToJidMap.size / 2} contact(s) mapped`,
          );
      }, 300);
    });
    ev.on("contacts.update", (updates) => {
      for (const update of updates) {
        if (store.contacts[update.id])
          Object.assign(store.contacts[update.id], update);
        else store.contacts[update.id] = update;
        const phoneJid = update.id?.endsWith("@s.whatsapp.net")
          ? update.id
          : store.contacts[update.id]?.id?.endsWith("@s.whatsapp.net")
            ? store.contacts[update.id].id
            : null;
        const lidJid = update.lid?.endsWith("@lid")
          ? update.lid
          : update.id?.endsWith("@lid")
            ? update.id
            : null;
        if (phoneJid && lidJid) {
          global.lidToJidMap.set(lidJid, phoneJid);
          global.lidToJidMap.set(phoneJid, lidJid);
        }
      }
    });
    ev.on("messages.upsert", ({ messages }) => {
      for (const msg of messages) {
        if (!msg.key?.remoteJid || !msg.key?.id) continue;
        const jid = msg.key.remoteJid;
        const cachedAt = Date.now();
        if (!store.messages[jid]) store.messages[jid] = {};
        if (!store.messageTimes[jid]) store.messageTimes[jid] = {};
        if (!store.messageQueue[jid]) store.messageQueue[jid] = [];
        store.messages[jid][msg.key.id] = msg;
        store.messageTimes[jid][msg.key.id] = cachedAt;
        store.messageQueue[jid].push({ id: msg.key.id, cachedAt });

        while (store.messageQueue[jid].length > MESSAGE_CACHE_MAX_PER_CHAT) {
          const oldest = store.messageQueue[jid].shift();
          if (store.messageTimes[jid][oldest.id] === oldest.cachedAt) {
            delete store.messages[jid][oldest.id];
            delete store.messageTimes[jid][oldest.id];
          }
        }
      }
    });
  },
  loadMessage: async (jid, id) => store.messages[jid]?.[id],
};

// KAMI Server configuration
let QR_GENERATE = "invalid";
let status = "initializing";
let AtlasSocket = null; // module-level reference for pairing API
let mongoAuth; // module-level so the GC/sync interval can access it
let clearAuthState = null;
let startPromise = null;
let restartTimer = null;
let pendingClearAuth = false;
let reconnectAttempt = 0;
let activeSocketGeneration = 0;
let socketGeneration = 0;
let socketStartedAt = 0;
let lastConnectionUpdateAt = Date.now();
let healthProbeFailures = 0;
let healthProbeRunning = false;
let stableConnectionTimer = null;
let shuttingDown = false;
let periodicSyncPromise = null;
let sessionSyncPaused = false;

const KEEP_ALIVE_INTERVAL_MS = 25_000;
const WATCHDOG_INTERVAL_MS =
  Math.max(
    30,
    Math.min(
      600,
      parseInt(process.env.WATCHDOG_INTERVAL_SECONDS || "60", 10) || 60,
    ),
  ) * 1000;
const HEALTH_QUERY_TIMEOUT_MS = 15_000;
const HEALTH_FAILURE_THRESHOLD = 2;
const CONNECT_STALL_TIMEOUT_MS = 180_000;
const SOCKET_CLOSE_TIMEOUT_MS = 5_000;
const RECONNECT_BASE_DELAY_MS = 3_000;
const RECONNECT_MAX_DELAY_MS = 60_000;
const STABLE_CONNECTION_MS = 300_000;

const isCurrentSocket = (socket, generation) =>
  AtlasSocket === socket && activeSocketGeneration === generation;

const clearStableConnectionTimer = () => {
  if (stableConnectionTimer) {
    clearTimeout(stableConnectionTimer);
    stableConnectionTimer = null;
  }
};

const markConnectionStableLater = (socket, generation) => {
  clearStableConnectionTimer();
  stableConnectionTimer = setTimeout(() => {
    if (isCurrentSocket(socket, generation) && status === "open") {
      reconnectAttempt = 0;
      console.log(chalk.green(`[ KAMI ] Connection stable - backoff reset`));
    }
  }, STABLE_CONNECTION_MS);
  stableConnectionTimer.unref?.();
};

const closeActiveSocket = async (reason) => {
  const socket = AtlasSocket;
  if (!socket) return;

  AtlasSocket = null;
  activeSocketGeneration = 0;
  socketStartedAt = 0;
  healthProbeFailures = 0;
  clearStableConnectionTimer();

  try {
    const endPromise = socket.end(
      new Boom(reason, {
        statusCode: DisconnectReason.connectionClosed,
      }),
    );
    const closedCleanly = await Promise.race([
      endPromise.then(() => true),
      new Promise((resolve) =>
        setTimeout(() => resolve(false), SOCKET_CLOSE_TIMEOUT_MS),
      ),
    ]);

    if (!closedCleanly) {
      console.log(
        chalk.yellow(
          `[ KAMI ] Socket close timed out - forcing WebSocket termination`,
        ),
      );
      socket.ws?.socket?.terminate?.();
      await Promise.race([
        endPromise,
        new Promise((resolve) => setTimeout(resolve, 1_000)),
      ]);
    }
  } catch (err) {
    console.error(
      chalk.redBright(`[ KAMI ] Socket cleanup error: ${err.message}`),
    );
  }
};

const getReconnectDelay = (immediate) => {
  if (immediate && reconnectAttempt === 1) return 250;
  const exponentialDelay = Math.min(
    RECONNECT_MAX_DELAY_MS,
    RECONNECT_BASE_DELAY_MS * 2 ** Math.max(0, reconnectAttempt - 1),
  );
  const jitter = Math.floor(exponentialDelay * 0.2 * Math.random());
  return exponentialDelay + jitter;
};

const scheduleReconnect = (
  reason,
  { clearAuth = false, immediate = false } = {},
) => {
  if (shuttingDown) return;

  pendingClearAuth = pendingClearAuth || clearAuth;
  if (restartTimer) {
    console.log(
      chalk.gray(`[ KAMI ] Reconnect already scheduled - ${reason}`),
    );
    return;
  }

  reconnectAttempt += 1;
  const delay = getReconnectDelay(immediate);
  status = "reconnecting";
  QR_GENERATE = "invalid";

  console.log(
    chalk.yellow(
      `[ KAMI ] Reconnect scheduled in ${(delay / 1000).toFixed(1)}s ` +
        `(attempt ${reconnectAttempt}) - ${reason}`,
    ),
  );

  restartTimer = setTimeout(async () => {
    restartTimer = null;
    const shouldClearAuth = pendingClearAuth;
    pendingClearAuth = false;

    try {
      await closeActiveSocket(`Reconnecting: ${reason}`);
      if (shouldClearAuth && clearAuthState) {
        sessionSyncPaused = true;
        await periodicSyncPromise;
        await clearAuthState();
      }

      const inFlightStart = startPromise;
      if (inFlightStart) {
        await inFlightStart;
      }
      await startAtlas(`reconnect: ${reason}`);
    } catch (err) {
      console.error(
        chalk.redBright(`[ KAMI ] Reconnect cycle failed: ${err.message}`),
      );
      scheduleReconnect(`reconnect cycle failed: ${err.message}`, {
        clearAuth: shouldClearAuth,
      });
    } finally {
      sessionSyncPaused = false;
    }
  }, delay);
};

async function startAtlas(trigger = "initial") {
  if (shuttingDown) return null;
  if (startPromise) return startPromise;
  if (AtlasSocket?.ws?.isOpen && status === "open") return AtlasSocket;

  status = "connecting";
  lastConnectionUpdateAt = Date.now();

  startPromise = connectAtlas(trigger)
    .catch((err) => {
      console.error(
        chalk.redBright(`[ KAMI ] Connection startup failed: ${err.message}`),
      );
      scheduleReconnect(`startup failed: ${err.message}`);
      return null;
    })
    .finally(() => {
      startPromise = null;
    });

  return startPromise;
}

const connectAtlas = async (trigger) => {
  console.log(chalk.cyan(`[ KAMI ] Starting connection (${trigger})...`));
  // ── Silently wipe the Cache folder on every boot / restart ──────────────
  try {
    const cacheDir = path.join(__dirname, "System", "Cache");
    if (fs.existsSync(cacheDir)) {
      for (const entry of fs.readdirSync(cacheDir)) {
        if (entry === ".gitkeep") continue; // preserve git tracker
        const entryPath = path.join(cacheDir, entry);
        fs.rmSync(entryPath, { recursive: true, force: true });
      }
    }
  } catch (_) {
    // intentionally silent
  }
  // ────────────────────────────────────────────────────────────────────────

  try {
    await mongoose.connect(mongodb);
    console.log(chalk.green(`[ KAMI ] MongoDB connected ✓`));
  } catch (err) {
    console.error(
      chalk.redBright(`[ EXCEPTION ] MongoDB error: ${err.message}`),
    );
  }
  const nextMongoAuth = new MongoAuth(sessionId);
  const { state, saveCreds, clearState } = await nextMongoAuth.init();
  mongoAuth = nextMongoAuth;
  clearAuthState = clearState;
  console.log(
    figlet.textSync("KAMI", {
      font: "Standard",
      horizontalLayout: "default",
      vertivalLayout: "default",
      width: 70,
      whitespaceBreak: true,
    }),
  );

  // Version info + update check
  const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
  global.botVersion = pkg.version;
  global.latestVersion = pkg.version;
  global.updateAvailable = false;

  console.log(
    chalk.cyan(
      `[ KAMI ] v${global.botVersion}  |  Node.js ${process.version}  |  ${process.platform}/${process.arch}`,
    ),
  );

  // No upstream version phone-home request.
  console.log("");

  // Do not download and execute remote plugins automatically at startup.

  const { version, isLatest } = await fetchLatestBaileysVersion();

  const generation = ++socketGeneration;
  const KAMI = makeWASocket({
    logger: pino({ level: "silent" }),
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    auth: state,
    version,
    // Send a WebSocket ping every 25 s so the server never silently drops
    // an idle connection. If the pong does not come back Baileys fires the
    // normal "connection.update" → "close" event, which restarts the bot.
    keepAliveIntervalMs: KEEP_ALIVE_INTERVAL_MS,
  });

  AtlasSocket = KAMI; // expose for pairing API
  activeSocketGeneration = generation;
  socketStartedAt = Date.now();
  lastConnectionUpdateAt = socketStartedAt;
  healthProbeFailures = 0;

  store.bind(KAMI.ev);

  KAMI.public = true;

  async function installPlugin() {
    console.log(chalk.cyan(`[ KAMI ] Checking plugins...`));
    let plugins = [];
    try {
      plugins = await getPluginURLs();
    } catch (err) {
      console.error(
        chalk.redBright(`[ EXCEPTION ] Plugin DB error: ${err.message}`),
      );
    }

    if (!plugins.length) {
      console.log(chalk.gray(`[ KAMI ] No extra plugins installed`));
    } else {
      console.log(
        chalk.cyan(`[ KAMI ] Installing ${plugins.length} plugin(s)...`),
      );
      for (let i = 0; i < plugins.length; i++) {
        const pluginUrl = plugins[i];
        try {
          const { body, statusCode } = await got(pluginUrl);
          if (statusCode == 200) {
            const folderName = "Plugins";
            const fileName = path.basename(pluginUrl);
            const filePath = path.join(folderName, fileName);
            let pluginBody = body;

            if (
              pluginBody.includes("alias:") &&
              !pluginBody.includes("uniquecommands:")
            ) {
              pluginBody = pluginBody.replace(
                /alias:\s*(\[[\s\S]*?\]),/,
                (match, aliasPart) =>
                  `${match}\n  uniquecommands: ${aliasPart},`,
              );
            }

            fs.writeFileSync(filePath, pluginBody);
            console.log(chalk.green(`[ KAMI ] ✓ ${fileName}`));
          } else {
            console.log(
              chalk.yellow(
                `[ KAMI ] ✗ ${path.basename(pluginUrl)} (HTTP ${statusCode})`,
              ),
            );
          }
        } catch (error) {
          console.error(
            chalk.redBright(
              `[ EXCEPTION ] ✗ ${path.basename(pluginUrl)}: ${error.message}`,
            ),
          );
        }
      }
      console.log(chalk.green(`[ KAMI ] Plugins ready`));
    }
  }

  await readcommands();

  KAMI.ev.on("creds.update", saveCreds);
  KAMI.serializeM = (m) => smsg(KAMI, m, store);
  KAMI.ev.on("connection.update", async (update) => {
    if (!isCurrentSocket(KAMI, generation)) return;

    const { lastDisconnect, connection, qr } = update;
    lastConnectionUpdateAt = Date.now();

    if (connection) {
      status = connection;
      console.info(`[ KAMI ] Server Status => ${connection}`);
    }

    if (connection === "open") {
      QR_GENERATE = "invalid";
      healthProbeFailures = 0;
      markConnectionStableLater(KAMI, generation);
    }

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      const reasonName = DisconnectReason[reason] || `unknown (${reason})`;
      const shouldClearAuth =
        reason === DisconnectReason.badSession ||
        reason === DisconnectReason.loggedOut;

      AtlasSocket = null;
      activeSocketGeneration = 0;
      socketStartedAt = 0;
      healthProbeFailures = 0;
      clearStableConnectionTimer();

      console.log(
        chalk.yellow(
          `[ KAMI ] Connection closed - ${reasonName}. Recovery starting.`,
        ),
      );
      scheduleReconnect(`disconnect: ${reasonName}`, {
        clearAuth: shouldClearAuth,
        immediate: reason === DisconnectReason.restartRequired,
      });
    }

    if (qr) {
      QR_GENERATE = qr;
      status = "qr";
      qrcodeTerminal.generate(qr, { small: true });
    }
  });

  KAMI.ev.on("group-participants.update", async (m) => {
    if (!isCurrentSocket(KAMI, generation)) return;
    welcomeLeft(KAMI, m);
  });

  KAMI.ev.on("messages.upsert", async (chatUpdate) => {
    if (!isCurrentSocket(KAMI, generation)) return;
    if (chatUpdate.type !== "notify") return;
    const msg = chatUpdate.messages?.[0];
    if (!msg) return;
    const m = serialize(KAMI, msg);

    if (!m?.message) return;
    if (m.key?.remoteJid === "status@broadcast") return;
    if (m.key?.id?.startsWith("BAE5") && m.key.id.length === 16) return;

    core(KAMI, m, commands, chatUpdate);
  });

  // ─── Anti-Delete: catch "delete for everyone" and resend ───────────────────
  KAMI.ev.on("messages.update", async (updates) => {
    if (!isCurrentSocket(KAMI, generation)) return;
    for (const { key, update } of updates) {
      try {
        // Only care about group "delete for everyone" events
        if (!key.remoteJid?.endsWith("@g.us")) continue;
        if (!update?.messageStubType) continue;
        // messageStubType 1 = REVOKE (delete for everyone)
        if (update.messageStubType !== 1) continue;

        const groupId = key.remoteJid;
        const isEnabled = await checkAntidelete(groupId);
        if (!isEnabled) continue;

        // Skip if this message was deleted by the bot itself (antilink, -delete cmd, etc.)
        if (global.botDeletedMsgIds?.has(key.id)) {
          global.botDeletedMsgIds.delete(key.id);
          continue;
        }

        // Look up the original message from store cache
        const cached = store.messages[groupId]?.[key.id];
        if (!cached) continue;

        const deleter = key.participant || key.remoteJid;

        const {
          extractMessageContent,
          getContentType,
          downloadContentFromMessage,
          jidNormalizedUser,
        } = await import("@whiskeysockets/baileys");

        // Skip if the original message was sent by the bot itself
        const botJid = KAMI.user?.id ? jidNormalizedUser(KAMI.user.id) : null;
        if (
          cached.key?.fromMe ||
          (botJid &&
            jidNormalizedUser(
              cached.key?.participant || cached.key?.remoteJid,
            ) === botJid)
        )
          continue;

        // Skip if the deleter is a group admin
        try {
          const groupMeta = await KAMI.groupMetadata(groupId);
          const admins = groupMeta.participants
            .filter((p) => p.admin === "admin" || p.admin === "superadmin")
            .map((p) => jidNormalizedUser(p.id));
          if (admins.includes(jidNormalizedUser(deleter))) continue;
        } catch {}

        // Skip if the deleter is a mod
        const isDeleterMod = await checkMod(deleter);
        if (isDeleterMod) continue;

        // Skip if the deleter is an owner
        const deleterDigits = deleter.replace(/[^0-9]/g, "");
        const ownerDigits = (global.owner || []).map((o) =>
          o.replace(/[^0-9]/g, ""),
        );
        if (ownerDigits.includes(deleterDigits)) continue;

        // Skip if the deleter is an integrated developer
        // No hard-coded developer exception.

        const senderTag = `@${deleter.split("@")[0]}`;

        // Determine content type
        const msg = cached.message;
        if (!msg) continue;

        const extracted = extractMessageContent(msg);
        const contentType = getContentType(extracted);
        const content = extracted[contentType];

        // Text messages
        if (
          contentType === "conversation" ||
          contentType === "extendedTextMessage"
        ) {
          const text =
            contentType === "conversation"
              ? extracted.conversation
              : content?.text || "";
          await KAMI.sendMessage(groupId, {
            text: `🛡️ *Anti-Delete*\n\n${senderTag} deleted:\n\n${text}`,
            mentions: [deleter],
          });
          continue;
        }

        // Media messages (image, video, audio, sticker, document)
        const isImage = contentType === "imageMessage";
        const isVideo = contentType === "videoMessage";
        const isAudio = contentType === "audioMessage";
        const isSticker = contentType === "stickerMessage";
        const isDoc = contentType === "documentMessage";

        if (isImage || isVideo || isAudio || isSticker || isDoc) {
          const mediaType = isImage
            ? "image"
            : isVideo
              ? "video"
              : isAudio
                ? "audio"
                : isSticker
                  ? "sticker"
                  : "document";
          const stream = await downloadContentFromMessage(content, mediaType);
          let buffer = Buffer.from([]);
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
          }

          const caption =
            `🛡️ *Anti-Delete*\n\n${senderTag} deleted this ${mediaType}` +
            (content.caption ? `:\n\n${content.caption}` : "");

          if (isImage) {
            await KAMI.sendMessage(groupId, {
              image: buffer,
              caption,
              mentions: [deleter],
            });
          } else if (isVideo) {
            await KAMI.sendMessage(groupId, {
              video: buffer,
              caption,
              mentions: [deleter],
            });
          } else if (isAudio) {
            await KAMI.sendMessage(groupId, {
              audio: buffer,
              mimetype: content.mimetype || "audio/ogg; codecs=opus",
              caption: undefined,
              mentions: [deleter],
            });
            await KAMI.sendMessage(groupId, {
              text: `🛡️ *Anti-Delete*\n\n${senderTag} deleted an audio message`,
              mentions: [deleter],
            });
          } else if (isSticker) {
            await KAMI.sendMessage(groupId, { sticker: buffer });
            await KAMI.sendMessage(groupId, {
              text: `🛡️ *Anti-Delete*\n\n${senderTag} deleted a sticker`,
              mentions: [deleter],
            });
          } else if (isDoc) {
            await KAMI.sendMessage(groupId, {
              document: buffer,
              mimetype: content.mimetype || "application/octet-stream",
              fileName: content.fileName || "document",
              caption,
              mentions: [deleter],
            });
          }
          continue;
        }

        // Fallback: unknown type — just notify
        await KAMI.sendMessage(groupId, {
          text: `🛡️ *Anti-Delete*\n\n${senderTag} deleted a message (type: ${contentType})`,
          mentions: [deleter],
        });
      } catch (e) {
        // Silently skip errors — don't crash the event loop
      }
    }
  });

  KAMI.getName = (jid, withoutContact = false) => {
    let id = KAMI.decodeJid(jid);
    withoutContact = KAMI.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us"))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {};
        if (!(v.name || v.subject)) v = KAMI.groupMetadata(id) || {};
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
          : id === KAMI.decodeJid(KAMI.user.id)
            ? KAMI.user
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

  KAMI.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (
        (decode.user && decode.server && decode.user + "@" + decode.server) ||
        jid
      );
    } else return jid;
  };

  KAMI.ev.on("contacts.update", (update) => {
    if (!isCurrentSocket(KAMI, generation)) return;
    for (let contact of update) {
      let id = KAMI.decodeJid(contact.id);
      if (store && store.contacts)
        store.contacts[id] = {
          id,
          name: contact.notify,
        };
    }
  });

  KAMI.downloadAndSaveMediaMessage = async (
    message,
    filename,
    attachExtension = true,
  ) => {
    let buffer;
    // Try Baileys v7 high-level download with reupload support first
    const fakeMsg = message.fakeObj || message;
    if (fakeMsg.key && fakeMsg.message) {
      try {
        buffer = await downloadMediaMessage(
          fakeMsg,
          "buffer",
          {},
          {
            logger: {
              info: () => {},
              debug: () => {},
              warn: () => {},
              error: () => {},
              child: () => ({
                info: () => {},
                debug: () => {},
                warn: () => {},
                error: () => {},
              }),
            },
            reuploadRequest: KAMI.updateMediaMessage,
          },
        );
      } catch (e) {
        // Fall through to legacy method
      }
    }
    // Legacy fallback using downloadContentFromMessage
    if (!buffer) {
      let quoted = message.msg ? message.msg : message;
      let mime = (message.msg || message).mimetype || "";
      let messageType = message.mtype
        ? message.mtype.replace(/Message/gi, "")
        : mime.split("/")[0];
      const stream = await downloadContentFromMessage(quoted, messageType);
      buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
    }
    let type = await fileTypeFromBuffer(buffer);
    const trueFileName = attachExtension ? filename + "." + type.ext : filename;
    await fs.promises.writeFile(trueFileName, buffer);
    return trueFileName;
  };

  KAMI.downloadMediaMessage = async (message) => {
    // Try Baileys v7 high-level download with reupload support first
    const fakeMsg = message.fakeObj || message;
    if (fakeMsg.key && fakeMsg.message) {
      try {
        return await downloadMediaMessage(
          fakeMsg,
          "buffer",
          {},
          {
            logger: {
              info: () => {},
              debug: () => {},
              warn: () => {},
              error: () => {},
              child: () => ({
                info: () => {},
                debug: () => {},
                warn: () => {},
                error: () => {},
              }),
            },
            reuploadRequest: KAMI.updateMediaMessage,
          },
        );
      } catch (e) {
        // Fall through to legacy method
      }
    }
    // Legacy fallback
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

  KAMI.parseMention = async (text) => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
      (v) => v[1] + "@s.whatsapp.net",
    );
  };

  KAMI.sendText = (jid, text, quoted = "", options) =>
    KAMI.sendMessage(
      jid,
      {
        text: text,
        ...options,
      },
      {
        quoted,
      },
    );

  KAMI.getFile = async (PATH, save) => {
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

  KAMI.setStatus = (status) => {
    // v7: query() removed — use updateProfileStatus instead (fire-and-forget)
    KAMI.updateProfileStatus(status).catch(() => {});
    return status;
  };

  KAMI.sendFile = async (jid, PATH, fileName, quoted = {}, options = {}) => {
    let types = await KAMI.getFile(PATH, true);
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
    await KAMI.sendMessage(
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

  return KAMI;
};

void startAtlas();

// Dynamic garbage collection — interval configurable via GC_INTERVAL_MINUTES env (default: 30)
const GC_INTERVAL_MINUTES = Math.max(
  1,
  parseInt(process.env.GC_INTERVAL_MINUTES || "30", 10),
);
// Periodic MongoDB session sync — runs at the same interval as GC
const runPeriodicSync = async () => {
  if (sessionSyncPaused || !mongoAuth || periodicSyncPromise) {
    return periodicSyncPromise;
  }

  periodicSyncPromise = mongoAuth
    .pushToMongoDB()
    .then(() => console.log(chalk.cyan(`[ KAMI ] Session synced to MongoDB`)))
    .catch((err) =>
      console.error(
        chalk.redBright(`[ KAMI ] MongoDB session sync error: ${err.message}`),
      ),
    )
    .finally(() => {
      periodicSyncPromise = null;
    });

  return periodicSyncPromise;
};

const runWatchdog = async () => {
  if (shuttingDown || healthProbeRunning) return;

  const socket = AtlasSocket;
  const generation = activeSocketGeneration;

  if (!socket) {
    const startingFor = Date.now() - lastConnectionUpdateAt;
    if (startPromise && startingFor > CONNECT_STALL_TIMEOUT_MS) {
      console.error(
        chalk.redBright(
          `[ KAMI ] Connection startup stalled for ` +
            `${Math.round(startingFor / 1000)}s - exiting for supervisor restart`,
        ),
      );
      process.exit(1);
    }

    if (!startPromise && !restartTimer && status !== "reconnecting") {
      scheduleReconnect("watchdog found no active socket");
    }
    return;
  }

  if (status === "connecting") {
    const connectingFor = Date.now() - socketStartedAt;
    if (socketStartedAt && connectingFor > CONNECT_STALL_TIMEOUT_MS) {
      scheduleReconnect(
        `connection stalled for ${Math.round(connectingFor / 1000)}s`,
        { immediate: true },
      );
    }
    return;
  }

  if (status !== "open") return;

  if (!socket.ws?.isOpen) {
    scheduleReconnect("watchdog found WebSocket closed", { immediate: true });
    return;
  }

  healthProbeRunning = true;
  try {
    const response = await socket.query(
      {
        tag: "iq",
        attrs: {
          to: "s.whatsapp.net",
          type: "get",
          xmlns: "w:p",
        },
        content: [{ tag: "ping", attrs: {} }],
      },
      HEALTH_QUERY_TIMEOUT_MS,
    );

    if (!response) {
      throw new Error("WhatsApp ping timed out");
    }

    if (isCurrentSocket(socket, generation)) {
      healthProbeFailures = 0;
      lastConnectionUpdateAt = Date.now();
    }
  } catch (err) {
    if (!isCurrentSocket(socket, generation)) return;

    healthProbeFailures += 1;
    console.error(
      chalk.yellow(
        `[ KAMI ] Watchdog probe failed ${healthProbeFailures}/` +
          `${HEALTH_FAILURE_THRESHOLD}: ${err.message}`,
      ),
    );

    if (healthProbeFailures >= HEALTH_FAILURE_THRESHOLD) {
      scheduleReconnect("WhatsApp health probes failed", { immediate: true });
    }
  } finally {
    healthProbeRunning = false;
  }
};

const watchdogTimer = setInterval(() => {
  void runWatchdog();
}, WATCHDOG_INTERVAL_MS);
const messageCacheTimer = setInterval(
  () => store.pruneMessages(),
  Math.min(
    10 * 60 * 1000,
    Math.max(60_000, Math.floor(MESSAGE_CACHE_TTL_MS / 2)),
  ),
);
console.log(
  chalk.cyan(
    `[ KAMI ] Connection watchdog active - probing every ` +
      `${WATCHDOG_INTERVAL_MS / 1000}s`,
  ),
);

let maintenanceTimer;
if (typeof global.gc === "function") {
  maintenanceTimer = setInterval(
    async () => {
      global.gc();
      console.log(
        chalk.cyan(
          `[ KAMI ] Garbage collection triggered (interval: ${GC_INTERVAL_MINUTES}m)`,
        ),
      );
      await runPeriodicSync();
    },
    GC_INTERVAL_MINUTES * 60 * 1000,
  );
  console.log(
    chalk.cyan(
      `[ KAMI ] GC scheduler active — running every ${GC_INTERVAL_MINUTES} minute(s)`,
    ),
  );
} else {
  console.warn(
    "[ KAMI ] GC not available. Start the bot with 'npm start' to enable garbage collection.",
  );
  // Still run session sync even without GC.
  maintenanceTimer = setInterval(
    () => {
      void runPeriodicSync();
    },
    GC_INTERVAL_MINUTES * 60 * 1000,
  );
}

const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  status = "stopping";
  console.log(chalk.yellow(`[ KAMI ] ${signal} received - shutting down`));

  if (restartTimer) clearTimeout(restartTimer);
  clearInterval(watchdogTimer);
  clearInterval(messageCacheTimer);
  clearInterval(maintenanceTimer);
  clearStableConnectionTimer();

  await Promise.race([
    runPeriodicSync(),
    new Promise((resolve) => setTimeout(resolve, 10_000)),
  ]);
  await closeActiveSocket(`Process shutdown: ${signal}`);
  await mongoose.disconnect().catch(() => {});
  process.exit(0);
};

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

app.use("/", express.static(join(__dirname, "Frontend")));

// --- GUI API Endpoints ---

app.get("/api/status", (req, res) => {
  res.json({
    status,
    websocketOpen: Boolean(AtlasSocket?.ws?.isOpen),
    reconnectAttempt,
    healthProbeFailures,
    lastConnectionUpdate: new Date(lastConnectionUpdateAt).toISOString(),
  });
});

// QR and pairing secrets are never exposed through HTTP.
// Scan the QR directly in the server terminal.
app.listen(PORT, "127.0.0.1", () => console.log(`[ KAMI ] Local status page: http://127.0.0.1:${PORT}`));
