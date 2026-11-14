import { extractMessageContent, downloadContentFromMessage, getContentType } from "@whiskeysockets/baileys";

let mergedCommands = ["revive", "viewonce", "vo", "antiviewonce"];

export default {
  name: "revive",
  alias: [...mergedCommands],
  uniquecommands: ["revive", "viewonce"],
  description: "Download and resend view once messages",

  start: async (KAMI, m, { inputCMD, quoted, doReact, prefix }) => {
    try {
      // Must be a reply to a message
      if (!m.quoted) {
        await doReact("❌");
        return m.reply(
          `Reply to a *view once* message with *${prefix}revive*`
        );
      }

      // Get the raw quoted message from contextInfo
      const contextInfo = m.msg?.contextInfo;
      if (!contextInfo?.quotedMessage) {
        await doReact("❌");
        return m.reply("Could not read the quoted message.");
      }

      const rawQuoted = contextInfo.quotedMessage;
      const quotedType = getContentType(rawQuoted);

      // Case 1: Wrapped in viewOnceMessage / viewOnceMessageV2 container
      const isWrappedViewOnce =
        quotedType === "viewOnceMessage" ||
        quotedType === "viewOnceMessageV2" ||
        quotedType === "viewOnceMessageV2Extension";

      // Case 2: Already unwrapped — imageMessage/videoMessage with viewOnce flag
      const innerMsg = rawQuoted[quotedType];
      const isUnwrappedViewOnce =
        !isWrappedViewOnce &&
        (quotedType === "imageMessage" || quotedType === "videoMessage") &&
        innerMsg?.viewOnce === true;

      if (!isWrappedViewOnce && !isUnwrappedViewOnce) {
        await doReact("❌");
        return m.reply(
          `This is not a view once message.\nReply to a *view once* image or video with *${prefix}revive*`
        );
      }

      await doReact("⏳");

      let mediaMsg, isImage, isVideo;

      if (isWrappedViewOnce) {
        // Unwrap the view-once container
        const extracted = extractMessageContent(rawQuoted);
        const mediaType = getContentType(extracted);
        mediaMsg = extracted[mediaType];
        isImage = mediaType.includes("image");
        isVideo = mediaType.includes("video");
      } else {
        // Already unwrapped — use directly
        mediaMsg = innerMsg;
        isImage = quotedType === "imageMessage";
        isVideo = quotedType === "videoMessage";
      }

      if (!mediaMsg) {
        await doReact("❌");
        return m.reply("Could not extract media from the view once message.");
      }

      // Download the media content
      const stream = await downloadContentFromMessage(
        mediaMsg,
        isImage ? "image" : "video"
      );
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (!buffer.length) {
        await doReact("❌");
        return m.reply("Failed to download the view once media.");
      }

      // Build caption
      const originalCaption = mediaMsg.caption || "";
      const caption =
        `👁️ *View Once Revived*\n\n` +
        (originalCaption ? `${originalCaption}\n\n` : "") +
        `_Revived by ${botName}_`;

      // Send as normal (non-view-once) message
      if (isImage) {
        await KAMI.sendMessage(
          m.from,
          { image: buffer, caption },
          { quoted: m }
        );
      } else {
        await KAMI.sendMessage(
          m.from,
          { video: buffer, caption },
          { quoted: m }
        );
      }

      await doReact("✅");
    } catch (e) {
      console.log("[ REVIVE ERROR ]", e.message);
      await doReact("❌");
      m.reply("Failed to revive the view once message. It may have expired.");
    }
  },
};
