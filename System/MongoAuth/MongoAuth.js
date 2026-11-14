import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { useMultiFileAuthState } from "@whiskeysockets/baileys";

// KAMI-MD: credentials remain on this host only; no MongoDB backups or transfers.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_BASE_DIR = path.join(__dirname, "..", "session");

export default class LocalAuth {
  constructor(sessionId) {
    this.sessionId = String(sessionId || "local").replace(/[^a-zA-Z0-9_-]/g, "_");
    this.dir = path.join(SESSION_BASE_DIR, this.sessionId);
  }

  async init() {
    await fs.promises.mkdir(this.dir, { recursive: true, mode: 0o700 });
    const { state, saveCreds } = await useMultiFileAuthState(this.dir);
    console.log("[ KAMI ] Using locally stored WhatsApp session; scan QR in terminal if needed.");
    return {
      state,
      saveCreds,
      clearState: async () => {
        await fs.promises.rm(this.dir, { recursive: true, force: true });
      },
    };
  }

  // Kept as a no-op for compatibility with callers expecting a sync method.
  async pushToMongoDB() {}
}
