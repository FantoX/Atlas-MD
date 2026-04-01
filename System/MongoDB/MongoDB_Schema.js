import mongoose from "mongoose";
import config from "../../Configurations.js";
const options = {
  socketTimeoutMS: 30000,
};

// ----------------------- Atlas can work with upto 4 MongoDB databases at once to distribute DB load  -------------------- //

const UserDb = mongoose.createConnection(config.mongodb, options); // You malually put first mongodb url here
const Systemdb = mongoose.createConnection(config.mongodb, options); // You malually put second mongodb url here

const GroupSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true, index: true },

    antilink: { type: Boolean, default: false, index: true },
    nsfw: { type: Boolean, default: false, index: true },
    bangroup: { type: Boolean, default: false, index: true },
    chatBot: { type: Boolean, default: false, index: true },

    botSwitch: { type: Boolean, default: true, index: true },
    switchNSFW: { type: Boolean, default: false },
    switchWelcome: { type: Boolean, default: false },
  },
  { autoIndex: true }
);

// Compound indexes (important for filters)
GroupSchema.index({ id: 1, botSwitch: 1 });
GroupSchema.index({ nsfw: 1, botSwitch: 1 });

const UserSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true, index: true },

    ban: { type: Boolean, default: false, index: true },
    name: { type: String, index: true }, // if you search users
    addedMods: { type: Boolean, default: false, index: true },
  },
  { autoIndex: true }
);

// Optional compound index
UserSchema.index({ id: 1, ban: 1 });

const CoreSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, default: "1", index: true },

    seletedCharacter: { type: String },
    PMchatBot: { type: Boolean, default: false, index: true },
    botMode: { type: String, default: "public", index: true },
  },
  { autoIndex: true }
);

// Since id is basically constant, index helps quick fetch
CoreSchema.index({ id: 1, botMode: 1 });

const PluginSchema = new mongoose.Schema(
  {
    plugin: { type: String, index: true },
    url: { type: String, index: true },
  },
  { autoIndex: true }
);

// Prevent duplicate plugins
PluginSchema.index({ plugin: 1 }, { unique: true });

const userData = UserDb.model("UserData", UserSchema);
const groupData = UserDb.model("GroupData", GroupSchema);
const systemData = Systemdb.model("SystemData", CoreSchema);
const pluginData = Systemdb.model("PluginData", PluginSchema);

export { groupData, pluginData, systemData, userData };
