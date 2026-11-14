import dotenv from "dotenv";
dotenv.config({ override: true });

// Strip inline # comments that some env injectors (e.g. vestauth) leave in the value,
// then trim surrounding whitespace.
// Example: "mykey     #old-key  # note" → "mykey"
const stripEnv = (val, fallback = "") => {
  if (!val) return fallback;
  return val.split("#")[0].trim() || fallback;
};

// Parse a comma-separated env value into a cleaned array, dropping known placeholders
const parseKeys = (envVal, ...placeholders) => {
  if (!envVal) return [];
  return envVal
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k && !placeholders.includes(k));
};

// Pick a random key from a pool; returns null when pool is empty
global.pickKey = (keys) => {
  if (!keys || keys.length === 0) return null;
  return keys[Math.floor(Math.random() * keys.length)];
};

let gg = process.env.MODS;
if (!gg) {
  gg = "923111008401,923395267262"; // You can replace this number with yours //
}

global.owner = gg.split(",");
global.mongodb = process.env.MONGODB || "mongodb://127.0.0.1:27017/kami";
global.sessionId = stripEnv(process.env.SESSION_ID, "local");
global.prefa = stripEnv(process.env.PREFIX, "-");
global.packname = stripEnv(process.env.PACKNAME, `KAMI-MD`);
global.author = stripEnv(process.env.AUTHOR, "Kamran Hasil");
global.port = stripEnv(process.env.PORT, "10000");

// Multi-key pools — comma-separate as many keys as you want in .env
global.geminiAPIKeys = parseKeys(
  process.env.GEMINI_API,
  "Put your gemini API key here",
  "your-gemini-api-key-here",
);
global.openAiAPIKeys = parseKeys(
  process.env.OPENAI_API,
  "Put your openai API key here",
  "sk-...put your OpenAI API key",
);
global.claudeAPIKeys = parseKeys(
  process.env.CLAUDE_API,
  "Put your claude API key here",
  "your-anthropic-api-key-here",
);
global.tenorAPIKeys = parseKeys(
  process.env.TENOR_API_KEY || "AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c",
);

// Dynamic getter — every access to `tenorApiKey` (used in Plugins) returns a random key from the pool
Object.defineProperty(global, "tenorApiKey", {
  get() {
    return global.pickKey(global.tenorAPIKeys) || "AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c";
  },
  configurable: true,
});

export default {
  mongodb: global.mongodb,
};
