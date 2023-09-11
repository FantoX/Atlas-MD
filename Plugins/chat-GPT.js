const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");

let mergedCommands = [
  "gpt",
  "ai",
  "imagegen",
  "dalle",
];

module.exports = {
  name: "apenai",
  alias: [...mergedCommands],
  uniquecommands:["ai","dalle"],
  description: "AI Commands",
  start: async (
    Atlas,
    m,
    {
      inputCMD,
      text,
      doReact,
      args,
    }
  ) => {
    const configuration = new Configuration({
      apiKey: global.openAiAPI,
    });
    const openai = new OpenAIApi(configuration);

    if (global.openAiAPI == null) {
      await doReact("❌");
      return m.reply(
        "Please put your OpenAI API Key in the *.env* or in *Configuration* file !"
      );
    }

    switch (inputCMD) {
      case "gpt":
      case "ai":
        if (!args.join(" ")) {
          await doReact("❔");
          return m.reply(`Please provide a message!`);
        }
        await doReact("✅");

        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        async function generateResponse(prompt, retries = 2) {
          try {
            const completion = await openai.createChatCompletion({
              model: "gpt-3.5-turbo",
              messages: [{ role: "user", content: prompt }],
            });

            console.log("API Key:", global.openAiAPI);

            return completion.data.choices[0].message.content.trim();
          } catch (error) {
            if (
              error.response &&
              error.response.status === 429 &&
              retries > 0
            ) {
              const retryAfter =
                error.response.headers["retry-after"] * 1000 || 5000;
              m.reply(
                `Rate limit exceeded. Retrying in ${
                  retryAfter / 1000
                } seconds...`
              );
              await sleep(retryAfter);
              return generateResponse(prompt, retries - 1);
            } else {
              console.error(error);
              await doReact("❌");
              return "Error occurred while generating response - API usage limit exceeded or wrong API key.";
            }
          }
        }

        generateResponse(text)
          .then((response) => {
            return Atlas.sendMessage(m.from, { text: response }, { quoted: m });
          })
          .catch((error) => {
            console.error("Error getting response:", error);
          });
        break;

      case "imagegen":
      case "dalle":
        if (!args.join(" ")) {
          await doReact("❔");
          return m.reply(`Please provide a prompt for image generation!`);
        }
        await doReact("✅");
        async function generateImage(prompt) {
          const API_URL = "https://api.openai.com/v1/images/generations";

          const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${global.openAiAPI}`,
          };

          const data = {
            model: "image-alpha-001",
            prompt: prompt,
            n: 1,
            size: "256x256",
          };

          try {
            const response = await axios.post(API_URL, data, {
              headers: headers,
            });
            return response.data.data[0].url;
          } catch (error) {
            console.error("Error generating image:", error);
            return null;
          }
        }

        generateImage(text)
          .then((imageUrl) => {
            if (!imageUrl) {
              return m.reply("Failed to generate an image - API usage limit exceeded or wrong API key.");
            }
            Atlas.sendMessage(
              m.from,
              { image: { url: imageUrl }, caption: text },
              { quoted: m }
            );
          })
          .catch((error) => {
            console.error("Error getting image:", error);
          });
        break;

      default:
        break;
    }
  },
};
