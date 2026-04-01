import { model, Schema } from "mongoose";

const schema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    session: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    autoIndex: false,
  }
);

schema.index({ sessionId: 1 });

export default model("Session", schema);
