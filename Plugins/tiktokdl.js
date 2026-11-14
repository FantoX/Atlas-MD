let mergedCommands = ["tiktok", "ttdl", "tt"];

export default {
  name: "tiktokDl",
  alias: [...mergedCommands],
  uniquecommands: ["tiktok", "ttdl", "tt"],
  description: "TikTok Downloader + Search",

  start: async (KAMI, m, { text, prefix, doReact }) => {
    try {
      const input = text || m.quoted?.text;

      if (!input) {
        return m.reply(`*TikTok Downloader*

Usage:
• ${prefix}tt <tiktok link>
• ${prefix}tt <search query>

Example:
• ${prefix}tt cosplay
• ${prefix}tt https://vt.tiktok.com/xxxxx`);
      }

      const regex =
        /(https:\/\/(vt|vm)\.tiktok\.com\/[^\s]+|https:\/\/www\.tiktok\.com\/@[\w.-]+\/video\/\d+)/;

      const detectedUrl = input.match(regex)?.[0];

      await doReact("⏳");
      await m.reply("Processing... ⏳");
      if (detectedUrl) {
        const apiRes = await fetch(
          `https://kelvdraapi.domku.xyz/downloader/tiktok?url=${encodeURIComponent(
            detectedUrl
          )}&apikey=tesApi`
        );

        const json = await apiRes.json();
        if (!json?.data) return m.reply("Failed to fetch TikTok data.");

        const data = json.data;

        const caption = `*『 Tiktok Downloader 』*

🎬 *Title:* ${data.title || "-"}
🌍 *Region:* ${data.region || "-"}
⏱ *Duration:* ${formatDuration(data.duration)}
👁 *Views:* ${formatNumber(data.play_count)}
💬 *Comments:* ${formatNumber(data.comment_count)}
🔁 *Shares:* ${formatNumber(data.share_count)}
👤 *Uploader:* ${data.author?.nickname || data.author?.unique_id || "-"}`;
        if (data.images && data.images.length > 0) {
          await KAMI.sendMessage(
            m.from,
            { text: caption },
            { quoted: m }
          );

          for (let img of data.images) {
            const imgRes = await fetch(img);
            const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

            await KAMI.sendMessage(
              m.from,
              { image: imgBuffer },
              { quoted: m }
            );
          }
        }

        else if (data.play) {
          let videoUrl = data.play.startsWith("http")
            ? data.play
            : "https://www.tikwm.com" + data.play;

          const vidRes = await fetch(videoUrl);
          if (!vidRes.ok) throw new Error("CDN Blocked");

          const videoBuffer = Buffer.from(await vidRes.arrayBuffer());

          await KAMI.sendMessage(
            m.from,
            {
              video: videoBuffer,
              caption,
            },
            { quoted: m }
          );
        }

        if (data.music_info?.play) {
          try {
            const audioRes = await fetch(data.music_info.play);
            const audioBuffer = Buffer.from(await audioRes.arrayBuffer());

            await KAMI.sendMessage(
              m.from,
              {
                audio: audioBuffer,
                mimetype: "audio/mpeg",
                fileName: `${sanitizeFileName(data.title || "tiktok")}.mp3`,
              },
              { quoted: m }
            );
          } catch {}
        }
      }

      else {
        const apiRes = await fetch(
          `https://kelvdraapi.domku.xyz/search/tiktok?query=${encodeURIComponent(
            input
          )}&count=1&apikey=tesApi`
        );

        const json = await apiRes.json();
        const video = json?.data?.videos?.[0];

        if (!video) return m.reply(`No results found for "${input}"`);

        let videoUrl = video.play.startsWith("http")
          ? video.play
          : "https://www.tikwm.com" + video.play;

        const caption = `*『 Tiktok Search Result 』*

🎬 *Title:* ${video.title}
🌍 *Region:* ${video.region}
⏱ *Duration:* ${formatDuration(video.duration)}
👁 *Views:* ${formatNumber(video.play_count)}
💬 *Comments:* ${formatNumber(video.comment_count)}
🔁 *Shares:* ${formatNumber(video.share_count)}
👤 *Uploader:* ${
          video.author?.nickname || video.author?.unique_id || "-"
        }`;

        const vidRes = await fetch(videoUrl);
        if (!vidRes.ok) throw new Error("CDN Blocked");

        const videoBuffer = Buffer.from(await vidRes.arrayBuffer());

        await KAMI.sendMessage(
          m.from,
          {
            video: videoBuffer,
            caption,
          },
          { quoted: m }
        );
      }

      await doReact("✅");

    } catch (err) {
      console.error("[ EXCEPTION ] TikTok Error:", err);
      await doReact("❌");
      m.reply("Failed to fetch TikTok. CDN blocked or API down.");
    }
  },
};


function formatNumber(num) {
  return Number(num || 0).toLocaleString();
}

function formatDuration(seconds) {
  if (!seconds) return "00:00";
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function sanitizeFileName(name) {
  return name.replace(/[<>:"/\\|?*]+/g, "").slice(0, 40);
}