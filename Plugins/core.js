const fs = require("fs");
const axios = require("axios");
const path = require("path");
const package = require("../package.json");
let mergedCommands = [
  "help",
  "h",
  "menu",
  "sc",
  "support",
  "supportgc",
  "script",
  "system",
  "info",
  "about",
];

module.exports = {
  name: "systemcommands",
  alias: [...mergedCommands],
  uniquecommands: ["help", "system", "about"],
  description: "All system commands",
  start: async (
    Atlas,
    m,
    { pushName, prefix, inputCMD, doReact, text, args }
  ) => {
    const pic = fs.readFileSync("./Assets/Atlas.jpg");
    switch (inputCMD) {

      case "help":
      case "h":
      case "menu":
        await doReact("☃️");
        await Atlas.sendPresenceUpdate("composing", m.from);
        function readUniqueCommands(dirPath) {
          const allCommands = [];

          const files = fs.readdirSync(dirPath);

          for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
              const subCommands = readUniqueCommands(filePath);
              allCommands.push(...subCommands);
            } else if (stat.isFile() && file.endsWith(".js")) {
              const command = require(filePath);

              if (Array.isArray(command.uniquecommands)) {
                const subArray = [file, ...command.uniquecommands];
                allCommands.push(subArray);
              }
            }
          }

          return allCommands;
        }

        function formatCommands(allCommands) {
          let formatted = "";

          for (const [file, ...commands] of allCommands) {
            const capitalizedFile =
              file.replace(".js", "").charAt(0).toUpperCase() +
              file.replace(".js", "").slice(1);

            formatted += `╟   🏮 *${capitalizedFile}* 🏮   ╢\n\n`;
            formatted += `\`\`\`${commands
              .map((cmd) => `⥼   ${prefix + cmd}`)
              .join("\n")}\`\`\`\n\n\n`;
          }

          return formatted.trim();
        }

        const pluginsDir = path.join(process.cwd(), "Plugins");

        const allCommands = readUniqueCommands(pluginsDir);
        const formattedCommands = formatCommands(allCommands);
        var helpText = `\nKonnichiwa *${pushName}* Senpai,\n\nI am *${botName}*, a WhatsApp bot built to take your boring WhatsApp experience into next level.\n\n*🔖 My Prefix is:*  ${prefix}\n\n${formattedCommands}\n\n\n*©️ YUKI*`;
        await Atlas.sendMessage(
          m.from,
          { video: { url: botVideo }, gifPlayback: true, caption: helpText },
          { quoted: m }
        );

        break;

      case "system":
      case "info":
      case "about":
        await doReact("🔰");
        let nodeVersion = process.version;
        let os = process.platform;
        let osVersion = process.release.lts;
        let architecture = process.arch;
        let computername = process.env.COMPUTERNAME;
        let os2 = process.env.OS;
        let cpu2 = process.env.PROCESSOR_IDENTIFIER;
        let core = process.env.NUMBER_OF_PROCESSORS;

        let txt4 = `            🧣 *System Info* 🧣


*〄 Node Version:* ${nodeVersion}

*〄 OS:* ${os2}

*〄 Platform:* ${os}

*〄 Os Version:* ${osVersion}

*〄 Computer Name:* ${computername}

*〄 CPU:* ${cpu2}

*〄 CPU Core:* ${core}

*〄 CPU Architecture:* ${architecture}

`;
        Atlas.sendMessage(m.from, { image: pic, caption: txt4 }, { quoted: m });

        break;

      default:
        break;
    }
  },
};
