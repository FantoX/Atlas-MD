import axios from "axios";

let mergedCommands = [
  "play",
  "song",
  "yt",
  "ytmp3",
  "mp3",
  "ytmp4",
  "video",
  "mp4",
  "video",
];

const YT_REGEX =
  /^(https?:\/\/)?((www|m|music)\.)?(youtube(-nocookie)?\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/)[\w-]+(\S+)?$/i;

const extractUrl = (text) => {
  if (!text) return null;
  const match = text.match(YT_REGEX);
  return match ? match[0] : null;
};

export default {
  name: "youtube",
  alias: [...mergedCommands],
  uniquecommands: ["play", "mp3", "mp4"],
  description: "Advanced YouTube system (API based)",

  start: async (KAMI, m, { inputCMD, text, doReact, prefix }) => {
    const botName = global.botName || "KAMI";
    let query = text?.trim();

    if (!query && m.quoted?.text) {
      query = m.quoted.text.trim();
    }

    if (!query) {
      return m.reply(`🎬 *YouTube Downloader*

📌 *Usage:*
• ${prefix}play <song name>
• ${prefix}mp3 <youtube link>
• ${prefix}video <video name>
• ${prefix}mp4 <youtube link>
• ${prefix}yts <query>

✨ Reply to link also works`);
    }

    try {
      switch (inputCMD) {
        case "mp4":
        case "ytmp4":
        case "video":
          await doReact("🎥");

          let videoUrl = extractUrl(query);
          if (!videoUrl) {
            const search = await axios.get(
              `https://api-faa.my.id/faa/youtube?q=${encodeURIComponent(query)}`,
            );
            if (!search.data.status || !search.data.result.length) {
              return m.reply("❌ No video found");
            }

            videoUrl = search.data.result[0].link;

            await KAMI.sendMessage(
              m.from,
              {
                image: { url: search.data.result[0].imageUrl },
                caption: `🎬 *${search.data.result[0].title}*\n⏱ ${search.data.result[0].duration}\n\n⬇️ Downloading...`,
              },
              { quoted: m },
            );
          }

          const videoRes = await axios.get(
            `https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(videoUrl)}`,
          );
          const videoData = videoRes.data;

          if (!videoData.status) throw new Error("API failed");

          await KAMI.sendMessage(
            m.from,
            {
              video: { url: videoData.result.download_url },
              mimetype: "video/mp4",
              caption: `🎬 *Video Downloaded*\n\n> Powered by ${botName}`,
            },
            { quoted: m },
          );

          await doReact("✅");
          break;

        case "mp3":
        case "ytmp3":
          await doReact("🎶");

          const audioUrl = extractUrl(query);
          if (!audioUrl)
            return m.reply(
              "❌ Invalid YouTube link. Please provide a valid YouTube URL for mp3.",
            );

          const audioRes = await axios.get(
            `https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(audioUrl)}`,
          );
          const audioData = audioRes.data;

          if (!audioData.status) throw new Error("API failed");

          const {
            title: audioTitle,
            thumbnail: audioThumbnail,
            mp3: audioMp3,
          } = audioData.result;

          await KAMI.sendMessage(
            m.from,
            {
              audio: { url: audioMp3 },
              mimetype: "audio/mpeg",
              contextInfo: {
                externalAdReply: {
                  title: audioTitle,
                  body: "🎧 YouTube Audio",
                  thumbnailUrl: audioThumbnail,
                  mediaType: 2,
                  renderLargerThumbnail: true,
                },
              },
            },
            { quoted: m },
          );
          break;

        case "play":
        case "song":
        case "yt":
          await doReact("📥");

          const playRes = await axios.get(
            `https://api-faa.my.id/faa/ytplay?query=${encodeURIComponent(query)}`,
          );
          const playData = playRes.data;

          if (!playData.status) throw new Error("API failed");

          const {
            title: playTitle,
            author: playAuthor,
            thumbnail: playThumbnail,
            mp3: playMp3,
          } = playData.result;

          await KAMI.sendMessage(
            m.from,
            {
              image: { url: playThumbnail },
              caption: `🎶 *${playTitle}*
👤 ${playAuthor}

⬇️ Downloading...`,
            },
            { quoted: m },
          );

          await KAMI.sendMessage(
            m.from,
            {
              audio: { url: playMp3 },
              mimetype: "audio/mpeg",
              contextInfo: {
                externalAdReply: {
                  title: playTitle,
                  body: playAuthor,
                  thumbnailUrl: playThumbnail,
                  mediaType: 2,
                  renderLargerThumbnail: true,
                },
              },
            },
            { quoted: m },
          );
          break;
      }
    } catch (err) {
      console.error("[ EXCEPTION ] Error converting to opus:", err);
      m.reply(`❌ Error: ${err.message}`);
    }
  },
};
