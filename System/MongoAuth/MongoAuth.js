import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { useMultiFileAuthState, BufferJSON } from "@whiskeysockets/baileys";
import { sessionSchema } from "./Schema/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All local sessions live under System/session/<sessionId>/
const SESSION_BASE_DIR = path.join(__dirname, "..", "session");

const LEGACY_KEY_TYPE_MAP = {
  preKeys: "pre-key",
  sessions: "session",
  senderKeys: "sender-key",
  appStateSyncKeys: "app-state-sync-key",
  appStateVersions: "app-state-sync-version",
  senderKeyMemory: "sender-key-memory",
};

export default class MongoAuth {
  /**
   * @param {string} sessionId
   */
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.dir = path.join(SESSION_BASE_DIR, sessionId);
  }

  /**
   * Initialize auth state using local → MongoDB → QR priority.
   * Returns { state, saveCreds, clearState } for makeWASocket.
   */
  async init() {
    console.log(`[ ATLAS ] Starting session: "${this.sessionId}"`);

    const localExists = await this._localExists();

    if (!localExists) {
      const mongoExists = await this._mongoExists();
      if (mongoExists) {
        console.log(
          `[ ATLAS ] [${this.sessionId}] Session not found locally — downloading from MongoDB...`,
        );

        try {
          await this._downloadToLocal();
        } catch (err) {
          console.error(
            `[ EXCEPTION ] [${this.sessionId}] Session download failed: ${err.message} — wiping partial files.`,
          );
          await fs.promises.rm(this.dir, { recursive: true, force: true });
        }

        const downloadOk = await this._localExists();
        if (downloadOk) {
          console.log(
            `[ ATLAS ] [${this.sessionId}] Session restored from MongoDB ✓`,
          );
        } else {
          console.log(
            `[ ATLAS ] [${this.sessionId}] Session download incomplete — starting fresh (QR scan required).`,
          );
          await fs.promises.rm(this.dir, { recursive: true, force: true });
        }
      } else {
        // Neither local nor MongoDB — empty dir triggers QR scan
        console.log(
          `[ ATLAS ] [${this.sessionId}] No existing session found — QR scan required.`,
        );
      }
    } else {
      console.log(`[ ATLAS ] [${this.sessionId}] Local session found ✓`);
    }

    await fs.promises.mkdir(this.dir, { recursive: true });

    const { state, saveCreds: saveCredsLocal } = await useMultiFileAuthState(
      this.dir,
    );

    const saveCreds = async () => {
      await saveCredsLocal();
      await this.pushToMongoDB().catch((err) =>
        console.error(
          `[ EXCEPTION ] MongoDB session sync error: ${err.message}`,
        ),
      );
    };

    const clearState = async () => {
      await this._clearSession();
    };

    return { state, saveCreds, clearState };
  }

  /**
   * Push all local session files to MongoDB.
   * Called by the periodic background sync (GC interval).
   */
  async pushToMongoDB() {
    const localExists = await this._localExists();
    if (!localExists) return;

    let entries;
    try {
      entries = await fs.promises.readdir(this.dir);
    } catch {
      return;
    }

    const files = {};
    for (const entry of entries) {
      const filePath = path.join(this.dir, entry);
      try {
        const stat = await fs.promises.stat(filePath);
        if (stat.isFile()) {
          const content = await fs.promises.readFile(filePath);
          files[entry] = content.toString("base64");
        }
      } catch {
        // skip unreadable files
      }
    }

    if (Object.keys(files).length === 0) return;

    await sessionSchema.updateOne(
      { sessionId: this.sessionId },
      { $set: { files, lastSync: new Date() } },
      { upsert: true },
    );
  }

  async _localExists() {
    const credsPath = path.join(this.dir, "creds.json");
    try {
      await fs.promises.access(credsPath);
      return true;
    } catch {
      return false;
    }
  }

  async _mongoExists() {
    try {
      const doc = await sessionSchema.findOne({ sessionId: this.sessionId });
      if (!doc) return false;
      if (
        doc.files &&
        Object.keys(doc.files).some(
          (k) => doc.files[k] && doc.files[k].length > 0,
        )
      )
        return true;
      if (doc.session && doc.session.length > 0) return true;
      return false;
    } catch {
      return false;
    }
  }

  async _downloadToLocal() {
    const doc = await sessionSchema.findOne({ sessionId: this.sessionId });
    if (!doc) return;

    if (doc.session && !doc.files) {
      await this._migrateLegacySession(doc.session);
      return;
    }

    if (!doc.files) return;
    await fs.promises.mkdir(this.dir, { recursive: true });
    for (const [filename, base64Content] of Object.entries(doc.files)) {
      if (!base64Content || base64Content.length === 0) {
        console.log(
          `[ ATLAS ] [${this.sessionId}] Skipping empty entry in MongoDB session: ${filename}`,
        );
        continue;
      }
      const filePath = path.join(this.dir, filename);
      await fs.promises.writeFile(
        filePath,
        Buffer.from(base64Content, "base64"),
      );
    }
  }

  /**
   * Convert the old single-blob session format into individual files that
   * useMultiFileAuthState can read, then push the new format to MongoDB.
   * @param {string} legacySessionString  The old `session` field value
   */
  async _migrateLegacySession(legacySessionString) {
    let parsed;
    try {
      parsed = JSON.parse(legacySessionString, BufferJSON.reviver);
    } catch (err) {
      console.error(
        `[ EXCEPTION ] Failed to parse legacy session blob: ${err.message}`,
      );
      return;
    }

    await fs.promises.mkdir(this.dir, { recursive: true });

    // Write creds.json
    if (parsed.creds) {
      await fs.promises.writeFile(
        path.join(this.dir, "creds.json"),
        JSON.stringify(parsed.creds, BufferJSON.replacer),
      );
    }

    const keys = parsed.keys || {};
    for (const [storageKey, baileyType] of Object.entries(
      LEGACY_KEY_TYPE_MAP,
    )) {
      const keyData = keys[storageKey];
      if (!keyData || typeof keyData !== "object") continue;
      for (const [id, value] of Object.entries(keyData)) {
        await fs.promises.writeFile(
          path.join(this.dir, `${baileyType}-${id}.json`),
          JSON.stringify(value, BufferJSON.replacer),
        );
      }
    }

    console.log(`[ ATLAS ] Legacy session migrated to new file-based format.`);

    await this.pushToMongoDB();
  }

  async _clearSession() {
    await fs.promises.rm(this.dir, { recursive: true, force: true });

    try {
      await sessionSchema.deleteOne({ sessionId: this.sessionId });
    } catch {
      // local is already cleared
    }

    console.log(`[ ATLAS ] Session cleared from local storage and MongoDB.`);
  }
}
