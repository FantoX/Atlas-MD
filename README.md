<p align="center">
  <a href="https://github.com/FantoX/Atlas-MD">
    <img src="https://i.imgur.com/MClOeqe.jpeg" width="100%">
  </a>
</p>

<h1 align="center">⚡ Atlas MD</h1>

<p align="center">
  <i>An Opensource WhatsApp bot by <a href="https://github.com/FantoX">FantoX</a> & Team Atlas — built with Baileys Multi-Device for maximum features, stability and compatibility.</i>
</p>

<p align="center">
  <a href="https://github.com/FantoX/Atlas-MD/fork">
    <img src="https://img.shields.io/github/forks/FantoX/Atlas-MD?label=Fork&style=social">
  </a>
  &nbsp;
  <a href="https://github.com/FantoX/Atlas-MD/stargazers">
    <img src="https://img.shields.io/github/stars/FantoX/Atlas-MD?style=social">
  </a>
</p>

<p align="center">
  <a href="https://github.com/FantoX/Atlas-MD/actions/workflows/ci.yml">
    <img src="https://github.com/FantoX/Atlas-MD/actions/workflows/ci.yml/badge.svg" alt="CI Build Status">
  </a>
</p>

<p align="center">
  <a href="https://github.com/FantoX">
    <img src="https://img.shields.io/badge/Owner-Team Atlas-white.svg?style=for-the-badge&logo=github" width="170px">
  </a>
  <a href="https://github.com/FantoX/Atlas-MD/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/FantoX/Atlas-MD?color=%231e81b0&style=for-the-badge" width="114px">
  </a>
  <a href="https://github.com/FantoX">
    <img src="https://img.shields.io/badge/Open%20Source-YES-green.svg?style=for-the-badge" width="150px">
  </a>
  <a href="https://github.com/FantoX">
    <img src="https://img.shields.io/badge/Maintained-YES-green.svg?style=for-the-badge" width="143px">
  </a>
</p>

<p align="center">
  <a href="https://cutt.ly/AtlasSupportStrict">
    <img src="https://img.shields.io/badge/Join%20Support%20Group-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" width="200px">
  </a>
</p>

---

## 🎀 Key Features at a Glance

| Feature                     | Details                                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 🤖 **Triple AI**            | ChatGPT · Claude · Gemini — with multi-key pool for rate-limit distribution                                                         |
| 💬 **Chatbot**              | Group chatbot (replies to @mentions) + DM chatbot (toggleable)                                                                      |
| 📥 **Universal Downloader** | TikTok · Instagram · Pinterest · Facebook · Twitter/X · Threads · Videy · Mega · SoundCloud · Spotify · YouTube · Sfile · MediaFire |
| 🎭 **26 Anime Reactions**   | bite, bonk, hug, kiss, slap, pat, cry... all as animated GIFs                                                                       |
| 🎨 **20 Bot Characters**    | Switch personality: Atlas, Power, Makima, Zero Two, Miku, Rem & 14 more                                                             |
| 🛡️ **Full Moderation**      | Silent ban (user & group), role hierarchy, bot mode (Self/Private/Public)                                                           |
| 👥 **Group Management**     | Promote, demote, tagall, antilink, welcome/goodbye, info, link & more                                                               |
| 🔖 **Sticker Toolkit**      | Make stickers from image/video, meme stickers, quote stickers, emoji mixer                                                          |
| 🔄 **Media Converters**     | Sticker↔Image/GIF/MP4, Video→MP3, Image→PDF, Media→URL, URL→QR                                                                      |
| 🔍 **Search Engine**        | Google, Wikipedia, YouTube, Lyrics, Weather, GitHub, Wallpapers, Ringtones                                                          |
| 🧩 **Live Plugin Store**    | Install/uninstall plugins from URL — no restart needed                                                                              |
| ☁️ **MongoDB Powered**      | All settings persist: bans, mods, modes, chatbot, welcome, characters                                                               |
| 🔧 **FFmpeg Bundled**       | No manual FFmpeg install needed — shipped via `ffmpeg-static`                                                                       |
| 🆔 **Baileys v7 Ready**     | Full LID resolution — owner detection & chatbot @mentions work correctly                                                            |

---

## 🚀 One-Click Deploy

<p align="center">

| Platform    | Deploy                                                                                                                                                                                                                                                                                                                                                                                       | Tutorial                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **Repl.it** | <a href="https://repl.it/github/FantoX/Atlas-MD"><img src="https://i.ibb.co/zrB5kMh/deploy-on-repl.jpg" alt="Deploy on Repl.it" height="32"></a>                                                                                                                                                                                                                                             | [▶ Watch](https://youtu.be/R-_DU73UH8Q) |
| **Railway** | <a href="https://railway.app/new/template/Gts2Zx?referralCode=f3gg2m"><img src="https://railway.app/button.svg" alt="Deploy on Railway" height="32"></a>                                                                                                                                                                                                                                     | [▶ Watch](https://youtu.be/Qs6ryWnEtu8) |
| **Koyeb**   | <a href="https://app.koyeb.com/apps/deploy?type=docker&image=quay.io/FantoX/Atlas-MD:main&env[PORT]=8000&env[PREFIX]=-&&env[MONGODB]=mongodb+srv://...&&env[SESSION_ID]=yourSession&&env[MODS]=918101187835&&env[TENOR_API_KEY]=AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c&&name=atlas"><img src="https://www.koyeb.com/static/images/deploy/button.svg" alt="Deploy on Koyeb" height="32"></a> | [▶ Watch](https://youtu.be/OvNnpK1Gx6Y) |
| **Heroku**  | <a href="https://heroku.com/deploy?template=https://github.com/FantoX/Atlas-MD"><img src="https://www.herokucdn.com/deploy/button.png" alt="Deploy on Heroku" height="32"></a>                                                                                                                                                                                                               | —                                       |

</p>

---

## ⚙️ Environment Variables

> Set these in `.env` (local) or as Environment Variables on your hosting platform.  
> Multiple API keys can be comma-separated — the bot picks one randomly per request.

| Variable              | Description                                                                                   | Required    |
| --------------------- | --------------------------------------------------------------------------------------------- | ----------- |
| `PREFIX`              | Command prefix (e.g. `-`, `.`, `!`)                                                           | ✅          |
| `MODS`                | Owner phone numbers without `+` or spaces, comma-separated (e.g. `9181011xxxxx,9198XXXXXXXX`) | ✅          |
| `MONGODB`             | Your MongoDB connection URL                                                                   | ✅          |
| `SESSION_ID`          | Any random string — acts as the bot session key                                               | ✅          |
| `TENOR_API_KEY`       | Tenor API key(s) for GIF commands, comma-separated                                            | ✅ for GIFs |
| `GEMINI_API`          | Google Gemini API key(s), comma-separated                                                     | Optional    |
| `OPENAI_API`          | OpenAI API key(s) starting with `sk-`, comma-separated                                        | Optional    |
| `CLAUDE_API`          | Anthropic Claude API key(s), comma-separated                                                  | Optional    |
| `PACKNAME`            | Sticker pack name (default: `Atlas Bot`)                                                      | Optional    |
| `AUTHOR`              | Sticker author name (default: `by: Team Atlas`)                                               | Optional    |
| `PORT`                | Server port (default: `10000`)                                                                | Optional    |
| `GC_INTERVAL_MINUTES` | MongoDB garbage collection interval in minutes (default: `5`)                                 | Optional    |
| `WATCHDOG_INTERVAL_SECONDS` | WhatsApp server health-probe interval in seconds (default: `60`)                         | Optional    |
| `MESSAGE_CACHE_TTL_MINUTES` | Anti-delete message retention in minutes (default: `360`, minimum: `30`)                  | Optional    |
| `MESSAGE_CACHE_MAX_PER_CHAT` | Maximum anti-delete messages retained per chat (default: `500`, minimum: `50`)            | Optional    |

---

## 📦 Local Installation

**Requirements:** [Node.js](https://nodejs.org/en/download/) · [Git](https://github.com/git-guides/install-git) · libwebp _(Linux only)_

> FFmpeg is **bundled automatically** via `ffmpeg-static` — no manual install needed!

```bash
# 1. Clone and enter the directory
git clone https://github.com/FantoX/Atlas-MD
cd Atlas-MD

# 2. Install dependencies
npm install

# 3. Copy and fill in your config
cp .env.example .env
# → Edit .env with your values

# 4. Start the bot using PM2
npm install -g pm2
pm2 start ecosystem.config.cjs
```

Scan the QR that appears in your browser via **WhatsApp → Linked Devices → Link a device**.

> **Lost your session?** Change `SESSION_ID` to any new random value in `.env` and restart.

---

## 🐧 Android (UserLand) Installation ( Ubultu / Debian / Kali OS )

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y bash git nodejs npm ffmpeg libwebp-dev imagemagick wget curl

git clone https://github.com/FantoX/Atlas-MD
cd Atlas-MD
npm install
npm install -g pm2

cp .env.example .env
# → Edit .env with your values

pm2 start ecosystem.config.cjs
```

**Stop bot:** `pm2 kill` &nbsp;|&nbsp; **Restart:** `pm2 restart Atlas` &nbsp;|&nbsp; **Update session:** edit `SESSION_ID` in `.env`, then `git pull && pm2 restart Atlas`

---

## ✨ Feature Highlights

**Atlas MD** comes packed with a robust set of features to power your groups and DMs. Instead of a massive list of commands, here are the top capabilities you get out-of-the-box:

- 🤖 **Advanced AI Integrations**: Seamlessly chat with Gemini, ChatGPT, and Claude. Built-in multi-key pools ensure you don't hit rate limits, and the AI can remember context for conversational interactions.
- 🛠️ **Group Moderation & Management**: Take full control of your groups. Features include silent bans (users are ignored by the bot), anti-link protection, customizable welcome/goodbye messages, tagging all members, and managing admin roles fluidly.
- 📥 **Universal Downloader**: Simply send a link from TikTok, Instagram, YouTube, X (Twitter), Pinterest, Spotify, Facebook, or SoundCloud, and the bot will instantly recognize and download the media or audio for you.
- 🖼️ **Media & Sticker Toolkit**: Create static, animated, or meme stickers directly from images and videos. Convert media between formats (MP4 to MP3, Image to PDF, Sticker to Video) with ease. Includes built-in Google Emoji Kitchen mixing!
- 🧩 **Live Plugin Architecture**: Expand the bot's functionality without ever shutting it down. Use `-install` to add new commands directly from GitHub gists or URLs on the fly.
- 🔍 **Search & Utilities**: Built-in Google searches, YouTube scraping, lyrics fetcher, HD wallpapers, Pinterest images, GitHub profiling, and real-time weather information.
- 🎭 **Anime Reactions & Characters**: Pick from 20 different anime bot personalities (like Power, Makima, Zero Two) and express yourself with dozens of high-quality animated reaction GIFs (bite, hug, slap, etc.).

> **Tip:** You can view the full list of available commands anytime by typing `-help` in your chat!

---

## 🎭 Bot Characters

Switch the bot's personality and profile picture with `-setchar <ID>`. Use `-charlist` to see all.

| ID  | Character     | Series                 | ID  | Character    | Series            |
| --- | ------------- | ---------------------- | --- | ------------ | ----------------- |
| 0   | **Atlas MD**  | Default                | 10  | **Mizuhara** | Rent-A-Girlfriend |
| 1   | **Power**     | Chainsaw Man           | 11  | **Rem**      | Re:Zero           |
| 2   | **Makima**    | Chainsaw Man           | 12  | **Sumi**     | Rent-A-Girlfriend |
| 3   | **Denji**     | Chainsaw Man           | 13  | **Kaguya**   | Kaguya-sama       |
| 4   | **Zero Two**  | Darling in the FranXX  | 14  | **Yumeko**   | Kakegurui         |
| 5   | **Chika**     | Kaguya-sama            | 15  | **Kurumi**   | Date A Live       |
| 6   | **Miku**      | Vocaloid               | 16  | **Mai**      | Bunny Girl Senpai |
| 7   | **Marin**     | My Dress-Up Darling    | 17  | **Yor**      | Spy x Family      |
| 8   | **Ayanokoji** | Classroom of the Elite | 18  | **Shinbou**  | Various           |
| 9   | **Ruka**      | Rent-A-Girlfriend      | 19  | **Eiko**     | Various           |

---

## 🔖 Plugin Store

Install any plugin with: `-install <url>`

| Plugin             | Commands                             | Install URL                                                                                                                                 |
| ------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Economy**        | Casino & gambling                    | `https://gist.githubusercontent.com/FantoX/63bcf78d6da0bce7d9f18343e3143fbc/raw/224c92477109f7082f698890fe510874da597d5c/economy.js`        |
| **RPG**            | RPG game commands                    | `https://gist.githubusercontent.com/FantoX/151e440d351549c896042155c223c59c/raw/2fbced16ebd14300f917248801c707d9733118ad/rpg.js`            |
| **Code Runner**    | Run code in-chat                     | `https://gist.githubusercontent.com/FantoX/8c2b76e4ed2d96eb370379a56f0cf330/raw/d3322fab57c52afd83cf83fc3f5afa493dc4e88f/code-Runner.js`    |
| **Audio Edit**     | 8 audio effects (pitch, bass, echo…) | `https://gist.githubusercontent.com/FantoX/4e097be1a35b9c00bf0bc9f6635e335b/raw/cc57a7780dd80612b62ded960af3d70d19662956/audio-edit.js`     |
| **Image Edit**     | 4 image manipulation commands        | `https://gist.githubusercontent.com/FantoX/9f6cb696d645a49a98abba00c570cfe9/raw/23154ec10c2ee08558a8aca44389f0a983aa4dea/image-Edit.js`     |
| **Text-to-Speech** | 7 language TTS                       | `https://gist.githubusercontent.com/FantoX/998a3b2937080af7c30a2639544fa24c/raw/afc9ba94cbaea95e971e3aea3f80e492249c75d7/text-to-speech.js` |
| **Logo Maker**     | 40 logo styles                       | `https://gist.githubusercontent.com/FantoX/67035f308b809aaabad8faa001fe473d/raw/72c2b3c100471375755817119c7ab391985bd7f3/logo-maker.js`     |
| **ChatGPT**        | ChatGPT + DALL-E                     | `https://gist.githubusercontent.com/FantoX/04507d2d7411996622513759ea05775d/raw/7d27fc2bb2f6d8a45d3e929e3904c66895d811ad/chat-GPT.js`       |
| **TikTok DL**      | 4 TikTok downloader commands         | `https://gist.githubusercontent.com/FantoX/2de67bc72021805417cbd317385ea71a/raw/f70879fc861dadd440f4a4a7dbb01cdae44b3c56/tiktokdl.js`       |
| **Fun**            | 17 fun party commands                | `https://gist.githubusercontent.com/FantoX/e02ed98798e5cc73a0778d8bc04f0f03/raw/77293b2b35d875ce0c91357d879fe5d0881423b9/fun.js`            |
| **Gemini AI**      | Google Gemini AI                     | Built-in — `ExtraPlugins_/gemini.js`                                                                                                        |
| **Claude AI**      | Anthropic Claude AI                  | Built-in — `ExtraPlugins_/claude.js`                                                                                                        |

---

## 💫 Dependencies

| Package                                                                    | Purpose                              |
| -------------------------------------------------------------------------- | ------------------------------------ |
| [WhiskeySockets Baileys v7](https://github.com/WhiskeySockets/Baileys)     | WhatsApp Multi-Device engine         |
| [MongoDB](https://www.mongodb.com/)                                        | Database for all persistent settings |
| [ffmpeg-static](https://www.npmjs.com/package/ffmpeg-static)               | Bundled FFmpeg — no manual install   |
| [wa-sticker-formatter](https://www.npmjs.com/package/wa-sticker-formatter) | Sticker creation and conversion      |
| [@google/genai](https://www.npmjs.com/package/@google/genai)               | Official Google Gemini AI SDK        |
| [@anthropic-ai/sdk](https://www.npmjs.com/package/@anthropic-ai/sdk)       | Official Anthropic Claude AI SDK     |
| [openai](https://www.npmjs.com/package/openai)                             | Official OpenAI SDK                  |

---

## 〽️ Why Atlas?

- **100% Open Source** — MIT license, fork and modify freely.
- **300+ Commands** across all plugins, plus a live plugin store for extending without restart.
- **Triple AI** (ChatGPT + Claude + Gemini) built-in with multi-key pools for rate-limit resilience.
- **Universal 13-Platform Downloader** — one command, any link.
- **Silent Banning** — banned users and groups receive zero response; bot acts as if it doesn't exist.
- **No local session storage** — session is stored in MongoDB for privacy and security.
- **Platform-agnostic** — works on Railway, Heroku, Koyeb, Render, Docker, pm2, and local.
- **FFmpeg bundled** — reactions and sticker conversions work out of the box, everywhere.

---

## 🧣 Contributors

Check the full [Contributors list](https://github.com/FantoX/Atlas-MD/graphs/contributors).  
PRs are welcome! Personal re-branding / bot-name-change PRs will **not** be merged.

---

## ⚠️ Warning

- This bot is **not made by WhatsApp Inc.** — overuse may result in account ban.
- Support is provided **only for deployment/setup**, not for custom development.
- Made for **Educational / Fun / Group Management** purposes only. Team Atlas is not responsible for misuse.

---

## 📛 Legal Disclaimer

- Use your **own MongoDB URL** for privacy and security.
- Heavy modifications are at your own risk — we cannot support every custom fork.
- We are not responsible for harm caused by individuals running this bot in groups.

---

<h2 align="center">🔰 Meet Team Atlas 🔰</h2>

<h3 align="center">Current Moderators</h3>

| [![Fantox](https://github.com/FantoX.png)](https://github.com/FantoX) | [![AYUSH](https://github.com/AYUSH-PANDEY023.png)](https://github.com/AYUSH-PANDEY023) | [![RA-ONE](https://github.com/7thRA-ONE.png)](https://github.com/7thRA-ONE) | [![Sten-X](https://github.com/Sten-X.png)](https://github.com/Sten-X) |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [FantoX](https://github.com/FantoX)                                   | [AYUSH-PANDEY023](https://github.com/AYUSH-PANDEY023)                                  | [7thRA-ONE](https://github.com/7thRA-ONE)                                   | [Sten-X](https://github.com/Sten-X)                                   |
| Owner, Main Developer, Maintainer                                     | Ideas, Testing                                                                         | Support Developer, Maintainer                                               | Support Developer, Maintainer (API)                                   |

<br>

<h3 align="center">Legacy Contributors</h3>

| [![Ahmii-kun](https://github.com/Ahmii-kun.png)](https://github.com/Ahmii-kun) | [![Pratyush](https://github.com/pratyush4932.png)](https://github.com/pratyush4932) | [![Devime](https://github.com/Devime69.png)](https://github.com/Devime69) |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [Ahmii-kun](https://github.com/Ahmii-kun)                                      | [pratyush4932](https://github.com/pratyush4932)                                     | [Devime69](https://github.com/Devime69)                                   |
| Support Developer (Old)                                                        | Support Developer (Old)                                                             | API Maintainer (Old)                                                      |
