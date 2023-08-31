const { initAuthCreds, BufferJSON, proto } = require("baileysjs");
const Database = require("./AuthDB");

module.exports = class Authenication {
  /**
   * @param {string} sessionId
   */
  constructor(sessionId) {
    this.sessionId = sessionId;
  }
  /**
   */
  getAuthFromDatabase = async () => {
    let creds;
    let keys = {};
    const storedCreds = await this.DB.getSession(this.sessionId);
    if (storedCreds !== null && storedCreds.session) {
      const parsedCreds = JSON.parse(storedCreds.session, BufferJSON.reviver);
      creds = parsedCreds.creds;
      keys = parsedCreds.keys;
    } else {
      if (storedCreds === null)
        await new this.DB.session({
          sessionId: this.sessionId,
        }).save();
      creds = initAuthCreds();
    }

    const saveState = async () => {
      const session = JSON.stringify(
        {
          creds,
          keys,
        },
        BufferJSON.replacer,
        2
      );
      await this.DB.session.updateOne(
        { sessionId: this.sessionId },
        { $set: { session } }
      );
    };

    const clearState = async () => {
      await this.DB.session.deleteOne({ sessionId: this.sessionId });
    };

    return {
      state: {
        creds,
        keys: {
          get: (type, ids) => {
            const key = this.KEY_MAP[type];
            return ids.reduce((dict, id) => {
              let value = keys[key]?.[id];
              if (value) {
                if (type === "app-state-sync-key") {
                  value = proto.AppStateSyncKeyData.fromObject(value);
                }

                dict[id] = value;
              }

              return dict;
            }, {});
          },
          set: (data) => {
            for (const _key in data) {
              const key = this.KEY_MAP[_key];
              keys[key] = keys[key] || {};
              Object.assign(keys[key], data[_key]);
            }
            saveState();
          },
        },
      },
      saveState,
      clearState,
    };
  };

  /**@private */
  DB = new Database();

  /**@private */
  KEY_MAP = {
    "pre-key": "preKeys",
    session: "sessions",
    "sender-key": "senderKeys",
    "app-state-sync-key": "appStateSyncKeys",
    "app-state-sync-version": "appStateVersions",
    "sender-key-memory": "senderKeyMemory",
  };
};
