import LRUCache from "../LRUCache.js";
import { groupData, pluginData, systemData, userData } from "../MongoDB/MongoDB_Schema.js";

// ─── In-Memory Cache ──────────────────────────────────────────────────────────
// TTLs are configurable via env; sensible defaults shown below.
const USER_CACHE_TTL = parseInt(process.env.USER_CACHE_TTL_MS || "300000", 10); // 5 min
const GROUP_CACHE_TTL = parseInt(process.env.GROUP_CACHE_TTL_MS || "300000", 10); // 5 min
const SYSTEM_CACHE_TTL = parseInt(process.env.SYS_CACHE_TTL_MS || "600000", 10); // 10 min

// user cache  : LRUCache<userId, { ban, addedMods }>
// group cache : LRUCache<groupId, { antilink, bangroup, chatBot, switchWelcome }>
// system cache: LRUCache<id, { seletedCharacter, PMchatBot, botMode }>
// link cache  : LRUCache<groupId, inviteCode>
const userCache = new LRUCache({ max: 10000, ttl: USER_CACHE_TTL });
const groupCache = new LRUCache({ max: 10000, ttl: GROUP_CACHE_TTL });
const systemCache = new LRUCache({ max: 1, ttl: SYSTEM_CACHE_TTL });
const linkCache = new LRUCache({ max: 1000, ttl: 3600000 }); // 1 hour

// ── helpers ──────────────────────────────────────────────────────────────────
function _getUser(userId) {
  return userCache.get(userId);
}
function _setUser(userId, fields) {
  const prev = userCache.get(userId) || {};
  userCache.set(userId, { ...prev, ...fields });
}
function _delUser(userId) {
  userCache.delete(userId);
}

function _getGroup(groupId) {
  return groupCache.get(groupId);
}
function _setGroup(groupId, fields) {
  const prev = groupCache.get(groupId) || {};
  groupCache.set(groupId, { ...prev, ...fields });
}
function _delGroup(groupId) {
  groupCache.delete(groupId);
}

function _getSys() {
  return systemCache.get("1");
}
function _setSys(fields) {
  const prev = systemCache.get("1") || {};
  systemCache.set("1", { ...prev, ...fields });
}
function _delSys() {
  systemCache.delete("1");
}

// ─── User Functions ───────────────────────────────────────────────────────────

// BAN USER
async function banUser(userId) {
  const user = await userData.findOne({ id: userId });
  if (!user) {
    await userData.create({ id: userId, ban: true });
    _setUser(userId, { ban: true, addedMods: false });
    return;
  }
  if (user.ban) {
    _setUser(userId, { ban: true, addedMods: user.addedMods });
    return;
  }
  await userData.findOneAndUpdate({ id: userId }, { $set: { ban: true } });
  _setUser(userId, { ban: true, addedMods: user.addedMods });
}

// CHECK BAN STATUS
async function checkBan(userId) {
  const cached = _getUser(userId);
  if (cached) return cached.ban ?? false;

  const user = await userData.findOne({ id: userId });
  if (!user) {
    _setUser(userId, { ban: false, addedMods: false });
    return false;
  }
  _setUser(userId, { ban: user.ban, addedMods: user.addedMods });
  return user.ban;
}

// UNBAN USER
async function unbanUser(userId) {
  const user = await userData.findOne({ id: userId });
  if (!user) {
    await userData.create({ id: userId, ban: false });
    _setUser(userId, { ban: false, addedMods: false });
    return;
  }
  if (!user.ban) {
    _setUser(userId, { ban: false, addedMods: user.addedMods });
    return;
  }
  await userData.findOneAndUpdate({ id: userId }, { $set: { ban: false } });
  _setUser(userId, { ban: false, addedMods: user.addedMods });
}

// ─── Mod Functions ────────────────────────────────────────────────────────────

// ADD MOD
async function addMod(userId) {
  if (global.owner?.includes(userId)) return;
  const user = await userData.findOne({ id: userId });
  if (!user) {
    await userData.create({ id: userId, addedMods: true });
    _setUser(userId, { ban: false, addedMods: true });
    return;
  }
  if (user.addedMods) {
    _setUser(userId, { ban: user.ban, addedMods: true });
    return;
  }
  await userData.findOneAndUpdate({ id: userId }, { $set: { addedMods: true } });
  _setUser(userId, { ban: user.ban, addedMods: true });
}

// CHECK MOD STATUS
async function checkMod(userId) {
  if (global.owner?.includes(userId)) return true;

  const cached = _getUser(userId);
  if (cached) return cached.addedMods ?? false;

  const user = await userData.findOne({ id: userId });
  if (!user) {
    _setUser(userId, { ban: false, addedMods: false });
    return false;
  }
  _setUser(userId, { ban: user.ban, addedMods: user.addedMods });
  return user.addedMods;
}

// DEL MOD
async function delMod(userId) {
  if (global.owner?.includes(userId)) return;
  const user = await userData.findOne({ id: userId });
  if (!user) {
    await userData.create({ id: userId, addedMods: false });
    _setUser(userId, { ban: false, addedMods: false });
    return;
  }
  if (!user.addedMods) {
    _setUser(userId, { ban: user.ban, addedMods: false });
    return;
  }
  await userData.findOneAndUpdate({ id: userId }, { $set: { addedMods: false } });
  _setUser(userId, { ban: user.ban, addedMods: false });
}

// ─── System / Character Functions ────────────────────────────────────────────

// SET CHAR ID
async function setChar(charId) {
  const character = await systemData.findOne({ id: "1" });
  if (!character) {
    await systemData.create({ id: "1", seletedCharacter: charId });
  } else {
    await systemData.findOneAndUpdate({ id: "1" }, { $set: { seletedCharacter: charId } });
  }
  _setSys({ seletedCharacter: charId });
}

// GET CHAR ID
async function getChar() {
  const cached = _getSys();
  if (cached?.seletedCharacter !== undefined) return cached.seletedCharacter;

  const character = await systemData.findOne({ id: "1" });
  if (!character) {
    _setSys({ seletedCharacter: "0" });
    return "0";
  }
  _setSys({
    seletedCharacter: character.seletedCharacter,
    PMchatBot: character.PMchatBot,
    botMode: character.botMode,
  });
  return character.seletedCharacter;
}

// ─── PM Chatbot Functions ─────────────────────────────────────────────────────

// ACTIVATE PM CHATBOT
async function activateChatBot() {
  const chatbotpm = await systemData.findOne({ id: "1" });
  if (!chatbotpm) {
    await systemData.create({ id: "1", PMchatBot: true });
  } else if (!chatbotpm.PMchatBot) {
    await systemData.findOneAndUpdate({ id: "1" }, { $set: { PMchatBot: true } });
  }
  _setSys({ PMchatBot: true });
}

// CHECK PM CHATBOT STATUS
async function checkPmChatbot() {
  const cached = _getSys();
  if (cached?.PMchatBot !== undefined) return cached.PMchatBot;

  const chatbotpm = await systemData.findOne({ id: "1" });
  if (!chatbotpm) {
    _setSys({ PMchatBot: false });
    return false;
  }
  _setSys({
    PMchatBot: chatbotpm.PMchatBot,
    seletedCharacter: chatbotpm.seletedCharacter,
    botMode: chatbotpm.botMode,
  });
  return chatbotpm.PMchatBot;
}

// DEACTIVATE PM CHATBOT
async function deactivateChatBot() {
  const chatbotpm = await systemData.findOne({ id: "1" });
  if (!chatbotpm) {
    await systemData.create({ id: "1", PMchatBot: false });
  } else if (chatbotpm.PMchatBot) {
    await systemData.findOneAndUpdate({ id: "1" }, { $set: { PMchatBot: false } });
  }
  _setSys({ PMchatBot: false });
}

// ─── Bot Mode ─────────────────────────────────────────────────────────────────

// SET BOT MODE
async function setBotMode(mode) {
  const selectedMode = await systemData.findOne({ id: "1" });
  if (!selectedMode) {
    await systemData.create({ id: "1", botMode: mode });
  } else if (selectedMode.botMode !== mode) {
    await systemData.findOneAndUpdate({ id: "1" }, { $set: { botMode: mode } });
  }
  _setSys({ botMode: mode });
}

// GET BOT MODE
async function getBotMode() {
  const cached = _getSys();
  if (cached?.botMode !== undefined) return cached.botMode;

  const selectedMode = await systemData.findOne({ id: "1" });
  if (!selectedMode) {
    _setSys({ botMode: "public" });
    return "public";
  }
  _setSys({
    botMode: selectedMode.botMode,
    PMchatBot: selectedMode.PMchatBot,
    seletedCharacter: selectedMode.seletedCharacter,
  });
  return selectedMode.botMode;
}

// ─── Group Functions ──────────────────────────────────────────────────────────

// SET WELCOME MESSAGE
async function setWelcome(groupID) {
  const group = await groupData.findOne({ id: groupID });
  if (!group) {
    await groupData.create({ id: groupID, switchWelcome: true });
  } else if (!group.switchWelcome) {
    await groupData.findOneAndUpdate({ id: groupID }, { $set: { switchWelcome: true } });
  }
  _setGroup(groupID, { switchWelcome: true });
}

// CHECK WELCOME MESSAGE STATUS
async function checkWelcome(groupID) {
  const cached = _getGroup(groupID);
  if (cached?.switchWelcome !== undefined) return cached.switchWelcome;

  const group = await groupData.findOne({ id: groupID });
  if (!group) {
    _setGroup(groupID, { switchWelcome: false });
    return false;
  }
  _setGroup(groupID, {
    switchWelcome: group.switchWelcome,
    antilink: group.antilink,
    chatBot: group.chatBot,
    bangroup: group.bangroup,
  });
  return group.switchWelcome;
}

// DELETE WELCOME MESSAGE
async function delWelcome(groupID) {
  const group = await groupData.findOne({ id: groupID });
  if (!group) {
    await groupData.create({ id: groupID, switchWelcome: false });
  } else if (group.switchWelcome) {
    await groupData.findOneAndUpdate({ id: groupID }, { $set: { switchWelcome: false } });
  }
  _setGroup(groupID, { switchWelcome: false });
}

// SET ANTI-LINK
async function setAntilink(groupID) {
  const group = await groupData.findOne({ id: groupID });
  if (!group) {
    await groupData.create({ id: groupID, antilink: true });
  } else if (!group.antilink) {
    await groupData.findOneAndUpdate({ id: groupID }, { $set: { antilink: true } });
  }
  _setGroup(groupID, { antilink: true });
}

// CHECK ANTI-LINK STATUS
async function checkAntilink(groupID) {
  const cached = _getGroup(groupID);
  if (cached?.antilink !== undefined) return cached.antilink;

  const group = await groupData.findOne({ id: groupID });
  if (!group) {
    _setGroup(groupID, { antilink: false });
    return false;
  }
  _setGroup(groupID, {
    antilink: group.antilink,
    switchWelcome: group.switchWelcome,
    chatBot: group.chatBot,
    bangroup: group.bangroup,
  });
  return group.antilink;
}

// DELETE ANTI-LINK
async function delAntilink(groupID) {
  const group = await groupData.findOne({ id: groupID });
  if (!group) {
    await groupData.create({ id: groupID, antilink: false });
  } else if (group.antilink) {
    await groupData.findOneAndUpdate({ id: groupID }, { $set: { antilink: false } });
  }
  _setGroup(groupID, { antilink: false });
}

// SET GROUP CHATBOT
async function setGroupChatbot(groupID) {
  const group = await groupData.findOne({ id: groupID });
  if (!group) {
    await groupData.create({ id: groupID, chatBot: true });
  } else if (!group.chatBot) {
    await groupData.findOneAndUpdate({ id: groupID }, { $set: { chatBot: true } });
  }
  _setGroup(groupID, { chatBot: true });
}

// CHECK GROUP CHATBOT STATUS
async function checkGroupChatbot(groupID) {
  const cached = _getGroup(groupID);
  if (cached?.chatBot !== undefined) return cached.chatBot;

  const group = await groupData.findOne({ id: groupID });
  if (!group) {
    _setGroup(groupID, { chatBot: false });
    return false;
  }
  _setGroup(groupID, {
    chatBot: group.chatBot,
    antilink: group.antilink,
    switchWelcome: group.switchWelcome,
    bangroup: group.bangroup,
  });
  return group.chatBot;
}

// DELETE GROUP CHATBOT
async function delGroupChatbot(groupID) {
  const group = await groupData.findOne({ id: groupID });
  if (!group) {
    await groupData.create({ id: groupID, chatBot: false });
  } else if (group.chatBot) {
    await groupData.findOneAndUpdate({ id: groupID }, { $set: { chatBot: false } });
  }
  _setGroup(groupID, { chatBot: false });
}

// BAN GROUP
async function banGroup(groupID) {
  const group = await groupData.findOne({ id: groupID });
  if (!group) {
    await groupData.create({ id: groupID, bangroup: true });
  } else if (!group.bangroup) {
    await groupData.findOneAndUpdate({ id: groupID }, { $set: { bangroup: true } });
  }
  _setGroup(groupID, { bangroup: true });
}

// CHECK BAN GROUP STATUS
async function checkBanGroup(groupID) {
  const cached = _getGroup(groupID);
  if (cached?.bangroup !== undefined) return cached.bangroup;

  const group = await groupData.findOne({ id: groupID });
  if (!group) {
    _setGroup(groupID, { bangroup: false });
    return false;
  }
  _setGroup(groupID, {
    bangroup: group.bangroup,
    antilink: group.antilink,
    switchWelcome: group.switchWelcome,
    chatBot: group.chatBot,
  });
  return group.bangroup;
}

// UNBAN GROUP
async function unbanGroup(groupID) {
  const group = await groupData.findOne({ id: groupID });
  if (!group) {
    await groupData.create({ id: groupID, bangroup: false });
  } else if (group.bangroup) {
    await groupData.findOneAndUpdate({ id: groupID }, { $set: { bangroup: false } });
  }
  _setGroup(groupID, { bangroup: false });
}

// ─── Plugin Functions ─────────────────────────────────────────────────────────

// PUSH NEW INSTALLED PLUGIN IN DATABASE
async function pushPlugin(newPlugin, url) {
  const plugin = new pluginData({ plugin: newPlugin, url: url });
  await plugin.save();
}

// Check if plugin is installed
async function isPluginPresent(pluginName) {
  const plugin = await pluginData.findOne({ plugin: pluginName });
  return !!plugin;
}

// DELETE A PLUGIN FROM THE DATABASE
async function delPlugin(pluginName) {
  const plugin = await pluginData.findOne({ plugin: pluginName });
  if (!plugin) {
    throw new Error("The plugin is not present in the database.");
  }
  await pluginData.deleteOne({ plugin: pluginName });
}

// Get all installed plugin URLs as an array
async function getPluginURLs() {
  const plugins = await pluginData.find({}, "url");
  return plugins.map((plugin) => plugin.url);
}

// Getting all plugins as an array
async function getAllPlugins() {
  return pluginData.find({}, { plugin: 1, url: 1 });
}

// ─── Cache Management ─────────────────────────────────────────────────────────

// Expose cache clear helpers (useful for testing or force-refresh scenarios)
function clearUserCache(userId) {
  if (userId) _delUser(userId);
  else userCache.clear();
}

function clearGroupCache(groupId) {
  if (groupId) _delGroup(groupId);
  else groupCache.clear();
}

function clearSystemCache() {
  _delSys();
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export {
  activateChatBot, // UNBAN
  addMod, // GET BOT MODE
  banGroup,
  banUser, // SET ANTILINK
  checkAntilink, // BAN
  checkBan, // BAN GROUP
  checkBanGroup, // SET GROUP CHATBOT
  checkGroupChatbot, // ADD MOD
  checkMod, // ACTIVATE PM CHATBOT
  checkPmChatbot, // SET WELCOME MESSAGE
  checkWelcome, // CLEAR USER CACHE (userId or all)
  clearGroupCache, // CLEAR GROUP CACHE (groupId or all)
  clearSystemCache, // GET ALL INSTALLED PLUGINS
  clearUserCache, // CHECK PM CHATBOT STATUS
  deactivateChatBot, // CHECK ANTILINK STATUS
  delAntilink, // CHECK GROUP CHATBOT STATUS
  delGroupChatbot, // CHECK MOD STATUS
  delMod, // CHECK IF PLUGIN IS INSTALLED
  delPlugin, // CHECK WELCOME MESSAGE STATUS
  delWelcome, // GET ALL INSTALLED PLUGIN URLs
  getAllPlugins, // SET BOT MODE
  getBotMode, // SET CHAR ID
  getChar, // UNBAN GROUP
  getPluginURLs, // PUSH NEW INSTALLED PLUGIN IN DATABASE
  isPluginPresent, // DEACTIVATE PM CHATBOT
  pushPlugin, // DELETE WELCOME MESSAGE
  setAntilink, // DELETE GROUP CHATBOT
  setBotMode, // DEL MOD
  setChar, // DELETE ANTILINK
  setGroupChatbot, // DELETE A PLUGIN FROM THE DATABASE
  setWelcome, // CHECK BAN STATUS OF A GROUP
  unbanGroup, // CHECK BAN STATUS
  unbanUser,
};
