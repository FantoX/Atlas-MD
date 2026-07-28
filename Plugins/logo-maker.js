import { createCanvas, loadImage } from "@napi-rs/canvas";

import axios from "axios";

const LOGO_TYPES = {
  "3dchristmas": {
    query: [
      "christmas snow",
      "xmas lights",
      "winter holiday",
      "christmas tree glow",
    ],
  },

  "3dneon": {
    query: [
      "neon cyberpunk",
      "neon lights city",
      "cyberpunk glow",
      "neon sign dark",
    ],
  },

  "3dspace": {
    query: ["galaxy space", "stars universe", "cosmic nebula", "deep space"],
  },

  "3dstone": {
    query: ["stone texture", "rock wall", "dark stone", "granite texture"],
  },

  bear: {
    query: ["bear wild", "grizzly forest", "animal bear", "wildlife bear"],
  },

  blackpink: {
    query: ["pink aesthetic", "kpop style", "blackpink vibe", "pink neon"],
  },

  blood: {
    query: ["blood red", "horror blood", "dark red splash", "bloody texture"],
  },

  bokeh: {
    query: [
      "bokeh lights",
      "blur lights",
      "night lights blur",
      "colorful blur",
    ],
  },

  candy: {
    query: [
      "candy sweet",
      "colorful candy",
      "sweets background",
      "sugar texture",
    ],
  },

  carbon: {
    query: ["carbon fiber", "dark fiber", "carbon texture", "tech fiber"],
  },

  chocolate: {
    query: ["chocolate texture", "dark chocolate", "sweet cocoa", "choco melt"],
  },

  christmas: {
    query: ["christmas winter", "snow holiday", "xmas glow", "festive lights"],
  },

  circuit: {
    query: [
      "circuit board",
      "tech motherboard",
      "electronic chip",
      "digital circuit",
    ],
  },

  cloud: {
    query: ["cloud sky", "blue sky clouds", "heaven sky", "soft clouds"],
  },

  deepsea: {
    query: ["deep sea", "underwater ocean", "sea blue", "ocean dark"],
  },

  demon: { query: ["demon dark", "devil fire", "hell flames", "evil shadow"] },

  dropwater: {
    query: ["water drops", "rain drops", "liquid splash", "water glass"],
  },

  glitch: {
    query: [
      "glitch effect",
      "rgb error",
      "digital distortion",
      "screen glitch",
    ],
  },

  glitch2: {
    query: ["glitch rgb", "error signal", "broken pixels", "tv glitch"],
  },

  glitch3: {
    query: ["rgb glitch", "cyber glitch", "matrix error", "distortion"],
  },

  graffiti: {
    query: ["graffiti wall", "street art", "urban spray", "hiphop wall"],
  },

  holographic: {
    query: ["holographic rainbow", "holo shine", "rainbow foil", "holo effect"],
  },

  joker: { query: ["joker dark", "clown evil", "joker smile", "dark face"] },

  lion: { query: ["lion king", "wild lion", "animal king", "lion roar"] },

  magma: { query: ["lava magma", "fire lava", "volcano heat", "molten rock"] },

  matrix: {
    query: ["matrix code", "green code rain", "hacker code", "digital matrix"],
  },

  neon: { query: ["neon light", "neon sign", "color neon", "night neon"] },

  neondevil: {
    query: ["neon devil", "dark neon red", "devil glow", "evil neon"],
  },

  neongreen: {
    query: ["green neon", "matrix green", "neon green glow", "laser green"],
  },

  neonlight: {
    query: ["neon lights", "color glow", "night city neon", "led light"],
  },

  papercut: {
    query: ["paper cut art", "paper layers", "cut design", "paper craft"],
  },

  pencil: {
    query: ["pencil sketch", "drawing sketch", "graphite art", "hand sketch"],
  },

  pornhub: {
    query: ["black orange", "dark orange theme", "contrast black orange"],
  },

  scifi: {
    query: ["sci fi future", "space tech", "futuristic neon", "alien tech"],
  },

  sparklechristmas: {
    query: [
      "christmas sparkle",
      "xmas glitter",
      "holiday shine",
      "snow sparkle",
    ],
  },

  thunder: {
    query: ["thunder lightning", "storm sky", "electric spark", "dark thunder"],
  },

  thunder2: {
    query: ["lightning storm", "electric sky", "flash thunder", "storm energy"],
  },

  transformer: {
    query: ["robot transformer", "metal robot", "futuristic robot", "ai robot"],
  },

  wall: {
    query: ["wall texture", "concrete wall", "grunge wall", "dark wall"],
  },

  wolf: { query: ["wolf wild", "dark wolf", "night wolf", "alpha wolf"] },

  fire: { query: ["fire flames", "burning fire", "heat flames", "red fire"] },

  ice: { query: ["ice blue", "frozen texture", "snow ice", "cold frost"] },

  gold: { query: ["gold texture", "luxury gold", "gold shine", "gold metal"] },

  silver: {
    query: ["silver metal", "chrome texture", "metal shine", "silver light"],
  },

  galaxy: {
    query: ["galaxy stars", "cosmic sky", "space nebula", "deep galaxy"],
  },

  rainbow: {
    query: [
      "rainbow colors",
      "color gradient",
      "multicolor light",
      "rainbow glow",
    ],
  },

  cyber: {
    query: ["cyberpunk city", "futuristic tech", "neon cyber", "dark cyber"],
  },

  hacker: {
    query: ["hacker code", "dark coding", "green terminal", "matrix hacker"],
  },

  dragon: {
    query: ["dragon fire", "fantasy dragon", "myth dragon", "dragon dark"],
  },

  angel: { query: ["angel light", "heaven glow", "white wings", "holy light"] },

  devil: { query: ["devil fire", "hell red", "dark demon", "evil fire"] },

  metal: {
    query: ["metal texture", "steel dark", "industrial metal", "iron texture"],
  },

  wood: {
    query: ["wood texture", "brown wood", "tree texture", "natural wood"],
  },

  retro: { query: ["retro neon", "80s style", "vintage neon", "retro wave"] },

  pixel: { query: ["pixel art", "8bit style", "retro pixel", "game pixel"] },

  anime: {
    query: ["anime background", "anime sky", "anime light", "anime art"],
  },

  gaming: {
    query: ["gaming setup", "rgb lights", "gamer neon", "esports vibe"],
  },

  dark: {
    query: ["dark black", "shadow background", "black texture", "night dark"],
  },

  light: { query: ["bright light", "white glow", "light rays", "soft light"] },

  abstract: {
    query: ["abstract art", "color waves", "fluid art", "abstract glow"],
  },
};

const fonts = ["Arial", "Impact", "Georgia", "Verdana", "Trebuchet MS"];

const gradients = [
  ["#ff00cc", "#3333ff", "#00ffff"],
  ["#ff512f", "#dd2476", "#ff9966"],
  ["#00ff87", "#60efff", "#00c9ff"],
  ["#ff0000", "#ff7300", "#ffdd00"],
];

export default {
  name: "logo",
  alias: Object.keys(LOGO_TYPES),
  uniquecommands: Object.keys(LOGO_TYPES),
  description: "Ultra Advanced Logo Maker",
  start: async (Atlas, m, { inputCMD, text, prefix }) => {
    if (!text) {
      return m.reply(`Example:\n${prefix}${inputCMD} Name|Tagline`);
    }

    try {
      const config = LOGO_TYPES[inputCMD];
      if (!config) return m.reply("Invalid type ❌");
      let [mainText, subText] = text.split("|");
      if (!subText) subText = "";
      const width = 1200;
      const height = 600;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      const api = "54164246-c83b8dee398b874d43650c040";
      const q = config.query[Math.floor(Math.random() * config.query.length)];

      const res = await axios.get(
        `https://pixabay.com/api/?key=${api}&q=${encodeURIComponent(q)}&image_type=photo&orientation=horizontal&per_page=50`,
      );

      const hits = res.data.hits;
      const randomImg = hits[Math.floor(Math.random() * hits.length)];
      const bg = await loadImage(randomImg.largeImageURL);

      ctx.drawImage(bg, 0, 0, width, height);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = "rgba(255,255,255,0.02)";
        ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
      }

      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * width,
          Math.random() * height,
          Math.random() * 3,
          0,
          Math.PI * 2,
        );

        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fill();
      }

      const font = fonts[Math.floor(Math.random() * fonts.length)];
      const gradColors =
        gradients[Math.floor(Math.random() * gradients.length)];
      const gradient = ctx.createLinearGradient(0, 0, width, 0);

      gradient.addColorStop(0, gradColors[0]);
      gradient.addColorStop(0.5, gradColors[1]);
      gradient.addColorStop(1, gradColors[2]);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      let fontSize = 120;
      if (mainText.length > 15) fontSize = 80;
      if (mainText.length > 25) fontSize = 60;

      ctx.font = `bold ${fontSize}px ${font}`;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 8;
      ctx.strokeText(mainText, width / 2, height / 2);
      ctx.shadowColor = gradColors[0];
      ctx.shadowBlur = 50;
      ctx.fillStyle = gradient;
      ctx.fillText(mainText, width / 2, height / 2);
      ctx.shadowBlur = 0;

      if (subText) {
        ctx.font = `bold 40px ${font}`;
        ctx.fillStyle = "#ffffffcc";
        ctx.fillText(subText, width / 2, height / 2 + 120);
      }

      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(0, height - 150, width, 150);
      ctx.strokeStyle = "#ffffff55";
      ctx.lineWidth = 3;
      ctx.strokeRect(15, 15, width - 30, height - 30);
      ctx.font = "20px Arial";
      ctx.fillStyle = "#ffffff88";
      ctx.fillText(`${botName}`, width - 150, height - 30);

      const buffer = canvas.toBuffer("image/png");

      await Atlas.sendMessage(
        m.from,
        {
          image: buffer,
          caption:
            `✨ *${inputCMD.toUpperCase()} LOGO GENERATED*\n\n` +
            `🎨 Style: Premium AI Canvas\n` +
            `⚡ Quality: Ultra HD\n\n` +
            `Made by *${botName}*`,
        },
        { quoted: m },
      );
    } catch (e) {
      console.log("LOGO ERROR:", e.message);
      m.reply("Error generating logo ❌");
    }
  },
};
