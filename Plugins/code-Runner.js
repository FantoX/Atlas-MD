const fs = require("fs");
const url = require("url");
const { checkMod } = require("../System/MongoDB/MongoDb_Core");
const https = require("https");
let mergedCommands = ["exec", "run", "html", "gethtml"];

module.exports = {
  name: "coderunner",
  alias: [...mergedCommands],
  uniquecommands: ["exec"],
  description: "To run JavaScript code in run time",
  start: async (
    Atlas,
    m,
    {
      pushName,
      prefix,
      inputCMD,
      doReact,
      text,
      args,
      participants,
      isCreator,
      body,
      botNumber,
      groupName,
      mentionByTag,
      mime,
      isBotAdmin,
      quoted,
      modcheck,
      isintegrated,
    }
  ) => {
    switch (inputCMD) {
      case "exec":
      case "run":
        isUsermod = await checkMod(m.sender);
        if (!isCreator && !isintegrated && !isUsermod) {
          await doReact("❌");
          return m.reply(
            "Sorry, only my *Mods* can use *Realtime Script Execution*."
          );
        }
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide a command to execute!\n\nExample: *${prefix}exec m.reply("3rd party code is being executed...")*`
          );
        }
        await doReact("🔰");
        try {
          const result = eval(text);
          out = JSON.stringify(result, null, "\t") || "Evaluated JavaScript";
        } catch (e) {
          m.reply(`Error: ${e.message}`);
        }
        break;

      case "html":
      case "gethtml":
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide an website to get HTML!\n\nExample: *${prefix}html target_website*`
          );
        }
        await doReact("🔰");
        try {
          if (text.split(" ")[0] != "--txt") {
            var parsedUrl = url.parse(text);
            var hostname = parsedUrl.hostname;
            var path = parsedUrl.pathname;
            var options = {
              hostname: hostname,
              path: path,
              method: "GET",
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
                Connection: "keep-alive",
                "Accept-Language": "en-US,en;q=0.9",
                Accept:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              },
            };
            const req = https.request(options, (res) => {
              let data = "";

              res.on("data", (chunk) => {
                data += chunk;
              });

              res.on("end", () => {
                fs.writeFile(`./System/Cache/${hostname}.html`, data, (err) => {
                  if (err) {
                    m.reply("Error: " + err.message);
                  } else {
                    const mainfile = fs.readFileSync(
                      `./System/Cache/${hostname}.html`
                    );
                    Atlas.sendMessage(
                      m.from,
                      {
                        document: mainfile,
                        fileName: `${hostname}.html`,
                        mimetype: "text/html",
                      },
                      { quoted: m }
                    );
                    fs.unlinkSync(`./System/Cache/${hostname}.html`);
                  }
                });
              });
            });

            req.on("error", (error) => {
              console.error("Error:", error);
            });

            req.end();
          } else {
            const target = text.replace("--txt ", "");
            var parsedUrl = url.parse(target);
            var hostname = parsedUrl.hostname;
            var path = parsedUrl.pathname;
            var options = {
              hostname: hostname,
              path: path,
              method: "GET",
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
                Connection: "keep-alive",
                "Accept-Language": "en-US,en;q=0.9",
                Accept:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              },
            };
            const req = https.request(options, (res) => {
              let data = "";

              res.on("data", (chunk) => {
                data += chunk;
              });

              res.on("end", () => {
                fs.writeFile(`./System/Cache/${hostname}.txt`, data, (err) => {
                  if (err) {
                    m.reply("Error: " + err.message);
                  } else {
                    const mainfile = fs.readFileSync(
                      `./System/Cache/${hostname}.txt`
                    );
                    Atlas.sendMessage(
                      m.from,
                      {
                        document: mainfile,
                        fileName: `${hostname}.txt`,
                        mimetype: "text/plain",
                      },
                      { quoted: m }
                    );
                    fs.unlinkSync(`./System/Cache/${hostname}.txt`);
                  }
                });
              });
            });

            req.on("error", (error) => {
              console.error("Error:", error);
            });

            req.end();
          }
        } catch (e) {
          await doReact("❌");
          m.reply(`Error: ${e.message}`);
        }

        break;

      default:
        break;
    }
  },
};
