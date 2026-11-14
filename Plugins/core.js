import fs from "fs";
import axios from "axios";
import path from "path";
import { pathToFileURL } from "url";
import os from "os";
let mergedCommands = [
  "help",
  "h",
  "menu",
  "sc",
  "support",
  "supportgc",
  "script",
  "alive",
  "uptime",
  "runtime",
  "ping",
  "status",
  "info",
  "sys",
  "restart",
  "reboot",
];

export default {
  name: "systemcommands",
  alias: [...mergedCommands],
  uniquecommands: ["script", "support", "help", "alive", "restart"],
  description: "All system commands",
  start: async (
    KAMI,
    m,
    {
      pushName,
      prefix,
      inputCMD,
      doReact,
      text,
      args,
      isCreator,
      isintegrated,
    },
  ) => {
    const pic = fs.readFileSync("./Assets/KAMI.jpg");
    switch (inputCMD) {
      case "alive":
      case "ping":
      case "status":
      case "info":
      case "sys":
      case "runtime":
      case "uptime": {
        await doReact("⚡");
        try {
          // safe() runs fn and returns null instead of throwing
          const safe = (fn) => {
            try {
              return fn() ?? null;
            } catch {
              return null;
            }
          };

          const botUptime = safe(() => {
            const up = process.uptime();
            return `${Math.floor(up / 3600)}h ${Math.floor((up % 3600) / 60)}m ${Math.floor(up % 60)}s`;
          });
          const sysUptime = safe(() => {
            const up = os.uptime();
            return `${Math.floor(up / 3600)}h ${Math.floor((up % 3600) / 60)}m`;
          });
          const heap = safe(() => {
            const m = process.memoryUsage();
            return `${(m.heapUsed / 1024 / 1024).toFixed(1)} / ${(m.heapTotal / 1024 / 1024).toFixed(1)} MB`;
          });
          const rss = safe(
            () => `${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} MB`,
          );
          const ram = safe(
            () =>
              `${((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
          );
          const runtime = safe(() =>
            process.versions.bun
              ? `Bun v${process.versions.bun}`
              : `Node.js ${process.version}`,
          );
          const platform = safe(() => `${os.platform()} (${process.arch})`);
          const env = safe(() => {
            if (process.env.DYNO) return "Heroku";
            if (
              process.env.RAILWAY_PROJECT_ID ||
              process.env.RAILWAY_ENVIRONMENT
            )
              return "Railway";
            if (process.env.RENDER) return "Render";
            if (process.env.KOYEB_APP_NAME || process.env.KOYEB_REGION)
              return "Koyeb";
            if (fs.existsSync("/.dockerenv")) return "Docker";
            if (
              process.env.PM2_HOME !== undefined ||
              process.env.pm_id !== undefined
            )
              return "pm2 (local)";
            return "Local";
          });
          const cpu = safe(() => {
            const c = os.cpus();
            return `${c.length}x ${c[0]?.model?.trim() || "Unknown"}`;
          });
          const load = safe(() => {
            const l = os.loadavg();
            return l[0] > 0
              ? `${l[0].toFixed(2)} / ${l[1].toFixed(2)} / ${l[2].toFixed(2)}`
              : null;
          });
          const pid = safe(() => String(process.pid));
          const ver = safe(() => {
            const v = global.botVersion;
            if (!v) return null;
            return global.updateAvailable
              ? `v${v} *(Update: v${global.latestVersion})*`
              : `v${v} ✓`;
          });

          // L() returns a formatted line or null — nulls are filtered out
          const L = (icon, label, val) =>
            val ? `${icon} *${label} :* ${val}` : null;

          const uptimeLines = [
            L("🔋", "Bot Uptime", botUptime),
            L("🖥️", "System Uptime", sysUptime),
          ].filter(Boolean);
          const memLines = [
            L("📦", "Heap", heap),
            L("🗃️", "RSS", rss),
            L("🧠", "System RAM", ram),
          ].filter(Boolean);
          const sysLines = [
            L("⚙️", "Runtime", runtime),
            L("🌐", "Platform", platform),
            L("🏠", "Environment", env),
            L("🔢", "CPU", cpu),
            L("📊", "Load Avg", load),
            L("🆔", "PID", pid),
          ].filter(Boolean);

          const parts = [
            `⚡ *KAMI — System Status*`,
            ``,
            `👤 *User :* ${pushName}`,
            `🤖 *Bot Status :* Online ✅`,
            ...(ver ? [`🔖 *Version :* ${ver}`] : []),
            ...(uptimeLines.length
              ? [``, `*━━━━━ 🕐 Uptime ━━━━━*`, ...uptimeLines]
              : []),
            ...(memLines.length
              ? [``, `*━━━━━ 💾 Memory ━━━━━*`, ...memLines]
              : []),
            ...(sysLines.length
              ? [``, `*━━━━━ 🔧 System ━━━━━*`, ...sysLines]
              : []),
          ];

          await KAMI.sendMessage(
            m.from,
            { image: pic, caption: parts.join("\n") },
            { quoted: m },
          );
        } catch (e) {
          await doReact("❌");
          m.reply(`Error: ${e.message}`);
        }
        break;
      }

      case "script":
      case "sc":
        await doReact("🧣");
        let repoInfo = await axios.get(
          "https://api.github.com/repos/kamran522/Atlas-MD",
        );
        let repo = repoInfo.data;
        let txt = `            🧣 *${botName}'s Script* 🧣\n\n*🎀 Total Forks:* ${
          repo.forks_count
        }\n*⭐ Total Stars:* ${repo.stargazers_count}\n*📜 License:* ${
          repo.license.name
        }\n*📁 Repo Size:* ${(repo.size / 1024).toFixed(
          2,
        )} MB\n*📅 Last Updated:* ${repo.updated_at}\n\n*🔗 Repo Link:* ${
          repo.html_url
        }\n\n❝ Dont forget to give a Star ⭐ to the repo. It's made with restless hardwork by *Kamran Hasil*. ❞\n\n*©️ Kamran Hasil- ${new Date().getFullYear()}*`;
        KAMI.sendMessage(m.from, { image: pic, caption: txt }, { quoted: m });
        break;

      case "support":
      case "supportgc":
        await doReact("🔰");
        let txt2 = `              🧣 *Support Group* 🧣\n\n*${botName}* is an open source project, and we are always happy to help you.\n\n*Link:* ${suppL}\n\n*Note:* Please don't spam in the group, and don't message *Admins directly* without permission. Ask for help inside *Group*.\n\n*Thanks for using KAMI.*`;
        KAMI.sendMessage(m.from, { image: pic, caption: txt2 }, { quoted: m });
        break;

      case "help":
      case "h":
      case "menu":
        await doReact("☃️");
        await KAMI.sendPresenceUpdate("composing", m.from);
        async function readUniqueCommands(dirPath) {
          const allCommands = [];

          const files = fs.readdirSync(dirPath);

          for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
              const subCommands = await readUniqueCommands(filePath);
              allCommands.push(...subCommands);
            } else if (stat.isFile() && file.endsWith(".js")) {
              try {
                const command = await import(pathToFileURL(filePath).href);
                const cmdDefault = command.default;

                if (cmdDefault && Array.isArray(cmdDefault.uniquecommands)) {
                  // Preferred: explicit uniquecommands list
                  const subArray = [file, ...cmdDefault.uniquecommands];
                  allCommands.push(subArray);
                } else if (
                  cmdDefault &&
                  Array.isArray(cmdDefault.alias) &&
                  cmdDefault.alias.length
                ) {
                  // Fallback: use alias list when uniquecommands not defined
                  const subArray = [file, ...cmdDefault.alias];
                  allCommands.push(subArray);
                }
              } catch (e) {
                // Skip broken plugins silently — don't let one bad import kill -h
              }
            }
          }

          return allCommands;
        }

        const categoryIcons = {
          core: { icon: "🎐", label: "ᴄᴏʀᴇ" },
          moderator: { icon: "🛡️", label: "ᴍᴏᴅᴇʀᴀᴛᴏʀ" },
          group: { icon: "🏮", label: "ɢʀᴏᴜᴘ ᴍᴀɴᴀɢᴇᴍᴇɴᴛ" },
          search: { icon: "🔍", label: "ꜱᴇᴀʀᴄʜ" },
          pictures: { icon: "🖼️", label: "ᴘɪᴄᴛᴜʀᴇꜱ" },
          sticker: { icon: "🎨", label: "ꜱᴛɪᴄᴋᴇʀ" },
          reactions: { icon: "🎭", label: "ʀᴇᴀᴄᴛɪᴏɴꜱ" },
          downloader: { icon: "📥", label: "ᴅᴏᴡɴʟᴏᴀᴅᴇʀ" },
          "youtube-dl": { icon: "🎬", label: "ʏᴏᴜᴛᴜʙᴇ ᴅʟ" },
          tiktokdl: { icon: "🎵", label: "ᴛɪᴋᴛᴏᴋ ᴅʟ" },
          converter: { icon: "🔄", label: "ᴄᴏɴᴠᴇʀᴛᴇʀ" },
          fun: { icon: "🎮", label: "ꜰᴜɴ & ᴍᴇᴅɪᴀ" },
          others: { icon: "✨", label: "ᴏᴛʜᴇʀꜱ" },
          plugin: { icon: "🔌", label: "ᴘʟᴜɢɪɴ" },

          "logo-maker": { icon: "🎨", label: "ʟᴏɢᴏ ᴍᴀᴋᴇʀ" },
          logo: { icon: "🖼️", label: "ʟᴏɢᴏ ꜱᴛʏʟᴇꜱ" },
          systemcommands: { icon: "⚙️", label: "ꜱʏꜱᴛᴇᴍ" },
          revive: { icon: "👁️", label: "ᴠɪᴇᴡ ᴏɴᴄᴇ" },
          tools: { icon: "🧰", label: "ᴛᴏᴏʟꜱ" },
        };

        function formatCommands(allCommands) {
          let formatted = "";
          for (const [file, ...commands] of allCommands) {
            const name = file.replace(".js", "");
            const meta = categoryIcons[name] || {
              icon: "📌",
              label: name.toUpperCase(),
            };
            const rows = [];
            for (let i = 0; i < commands.length; i += 3) {
              const chunk = commands
                .slice(i, i + 3)
                .map((c) => `${prefix}${c}`)
                .join(", ");
              rows.push(`    ❯  ${chunk}`);
            }
            const cmdLines = rows.join("\n");
            formatted += `╭─❖ *${meta.label}* ❖\n${cmdLines}\n╰──────────────────\n\n`;
          }
          return formatted.trim();
        }

        // Uptime calculation
        const upSec = Math.floor(process.uptime());
        const upH = Math.floor(upSec / 3600);
        const upM = Math.floor((upSec % 3600) / 60);
        const upS = upSec % 60;
        const uptimeStr = `${upH}h ${upM}m ${upS}s`;

        const pluginsDir = path.join(process.cwd(), "Plugins");
        const allCommands = await readUniqueCommands(pluginsDir);
        const totalCmds = allCommands.reduce(
          (acc, arr) => acc + arr.length - 1,
          0,
        );
        const formattedCommands = formatCommands(allCommands);

        var helpText = [
          `ᴋᴏɴɴɪᴄʜɪᴡᴀ *${pushName}* ꜱᴇɴᴘᴀɪ 👋`,
          `ɪ ᴀᴍ *${botName}*, ᴀ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ`,
          `ᴅᴇᴠᴇʟᴏᴘᴇᴅ ʙʏ *Kamran Hasil* 🌸`,
          ``,
          `🎀 *ᴘʀᴇꜰɪx* : \`${prefix}\``,
          `📦 *ᴄᴏᴍᴍᴀɴᴅꜱ* : *${totalCmds}* ᴀᴠᴀɪʟᴀʙʟᴇ`,
          `🕐 *ᴜᴘᴛɪᴍᴇ* : ${uptimeStr}`,
          ``,
          formattedCommands,
          ``,
          `*ꜱᴜᴘᴘᴏʀᴛ ɢʀᴏᴜᴘ:* \`${prefix}support\``,
          ``,
          `ᴘᴏᴡᴇʀᴇᴅ ʙʏ: © *Kamran Hasil*`,
        ].join("\n");

        await KAMI.sendMessage(
          m.from,
          { video: { url: botVideo }, gifPlayback: true, caption: helpText },
          { quoted: m },
        );

        break;

      case "reboot":
      case "restart": {
        if (!isCreator && !isintegrated) {
          await doReact("❌");
          return KAMI.sendMessage(
            m.from,
            { text: `Only *Owners* can restart the bot !` },
            { quoted: m },
          );
        }
        await doReact("🔄");
        await KAMI.sendMessage(
          m.from,
          {
            text: `♻️ *Restarting bot...*\n\nBot will be back online shortly !`,
          },
          { quoted: m },
        );

        setTimeout(async () => {
          const isPm2 =
            process.env.PM2_HOME !== undefined ||
            process.env.pm_id !== undefined;
          if (isPm2) {
            process.exit(0);
          } else {
            const { spawn } = await import("child_process");
            const logPath = path.join(process.cwd(), "kami.log");
            const logFd = fs.openSync(logPath, "a");
            const child = spawn(
              process.execPath,
              [...process.execArgv, ...process.argv.slice(1)],
              {
                detached: true,
                stdio: ["ignore", logFd, logFd],
                env: process.env,
                cwd: process.cwd(),
              },
            );
            child.unref();
            process.exit(0);
          }
        }, 2000);
        break;
      }

      default:
        break;
    }
  },
};
