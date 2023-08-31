const { model, Schema } = require("mongoose");

const schema = new Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },

  session: String,
});

module.exports = model("sessionschemas", schema);