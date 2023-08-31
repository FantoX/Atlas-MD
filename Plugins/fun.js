const axios = require("axios");

let mergedCommands = [
  "truth",
  "dare",
  "coinflip",
  "dice",
  "fact",
  "awesomecheck",
  "charactercheck",
  "cutecheck",
  "gaycheck",
  "greatcheck",
  "handsomecheck",
  "hornycheck",
  "lesbiancheck",
  "maturecheck",
  "prettycheck",
  "staminacheck",
  "uglycheck",
];

module.exports = {
  name: "fun",
  alias: [...mergedCommands],
  uniquecommands: [
    "truth",
    "dare",
    "coinflip",
    "dice",
    "fact",
    "awesomecheck",
    "charactercheck",
    "cutecheck",
    "gaycheck",
    "greatcheck",
    "handsomecheck",
    "hornycheck",
    "lesbiancheck",
    "maturecheck",
    "prettycheck",
    "staminacheck",
    "uglycheck",
  ],
  description: "All fun Commands",
  start: async (
    Atlas,
    m,
    { text, args, prefix, inputCMD, mentionedJid, mentionByTag,doReact }
  ) => {
    function randomNumberPicker(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
    switch (inputCMD) {
      case "truth":
        await doReact("🤔");
        const truth = [
          "Have you ever liked anyone? How long?",
          "If you can or if you want, which gc/outside gc would you make friends with? (maybe different/same type)",
          "apa ketakutan terbesar kamu?",
          "Have you ever liked someone and felt that person likes you too?",
          "What is the name of your friend's ex-girlfriend that you used to secretly like?",
          "Have you ever stolen money from your father or mom? The reason?",
          "What makes you happy when you're sad?",
          "Ever had a one sided love? if so who? how does it feel bro?",
          "been someone's mistress?",
          "the most feared thing",
          "Who is the most influential person in your life?",
          "what proud thing did you get this year",
          "Who is the person who can make you awesome",
          "Who is the person who has ever made you very happy?",
          "Who is closest to your ideal type of partner here",
          "Who do you like to play with??",
          "Have you ever rejected people? the reason why?",
          "Mention an incident that made you hurt that you still remember",
          "What achievements have you got this year??",
          "What's your worst habit at school??",
          "What song do you sing most in the shower",
          "Have you ever had a near-death experience",
          "When was the last time you were really angry. Why?",
          "Who is the last person who called you",
          "Do you have any hidden talents, What are they",
          "What word do you hate the most?",
          "What is the last YouTube video you watched?",
          "What is the last thing you Googled",
          "Who in this group would you want to swap lives with for a week",
          "What is the scariest thing thats ever happened to you",
          "Have you ever farted and blamed it on someone else",
          "When is the last time you made someone else cry",
          "Have you ever ghosted a friend",
          "Have you ever seen a dead body",
          "Which of your family members annoys you the most and why",
          "If you had to delete one app from your phone, which one would it be",
          "What app do you waste the most time on",
          "Have you ever faked sick to get home from school",
          "What is the most embarrassing item in your room",
          "What five items would you bring if you got stuck on a desert island",
          "Have you ever laughed so hard you peed your pants",
          "Do you smell your own farts",
          "have u ever peed on the bed while sleeping ðŸ¤£ðŸ¤£",
          "What is the biggest mistake you have ever made",
          "Have you ever cheated in an exam",
          "What is the worst thing you have ever done",
          "When was the last time you cried",
          "whom do you love the most among ur parents",
          "do u sometimes put ur finger in ur nosetrilðŸ¤£",
          "who was ur crush during the school days",
          "tell honestly, do u like any boy in this grup",
          "have you ever liked anyone? how long?",
          "do you have gf/bf','what is your biggest fear?",
          "have you ever liked someone and felt that person likes you too?",
          "What is the name of your ex boyfriend of your friend that you once liked quietly?",
          "ever did you steal your mothers money or your fathers money",
          "what makes you happy when you are sad",
          "do you like someone who is in this grup? if you then who?",
          "have you ever been cheated on by people?",
          "who is the most important person in your life",
          "what proud things did you get this year",
          "who is the person who can make you happy when u r sad",
          "who is the person who ever made you feel uncomfortable",
          "have you ever lied to your parents",
          "do you still like ur ex",
          "who do you like to play together with?",
          "have you ever stolen big thing in ur life? the reason why?",
          "Mention the incident that makes you hurt that you still remember",
          "what achievements have you got this year?",
          "what was your worst habit at school?",
          "do you love the bot creator Fantox?",
          "have you ever thought of taking revenge from ur teacher?",
          "do you like current prime minister of ur country",
          "you non veg or veg",
          "if you could be invisible, what is the first thing you would do",
          "what is a secret you kept from your parents",
          "Who is your secret crush",
          "whois the last person you creeped on social media",
          "If a genie granted you three wishes, what would you ask for",
          "What is your biggest regret",
          "What animal do you think you most look like",
          "How many selfies do you take a day",
          "What was your favorite childhood show",
          "if you could be a fictional character for a day, who would you choose",
          "whom do you text the most",
          "What is the biggest lie you ever told your parents",
          "Who is your celebrity crush",
          "Whats the strangest dream you have ever had",
          "do you play pubg, if you then send ur id number",
        ];
        const truthData = truth[Math.floor(Math.random() * truth.length)];

        await Atlas.sendMessage(
          m.from,
          { image: { url: botImage3 }, caption: `*${truthData}*` },
          { quoted: m }
        );
        break;

      case "dare":
        await doReact("😎");
        const dare = [
          "eat 2 tablespoons of rice without any side dishes, if it's dragging you can drink",
          "spill people who make you pause",
          "call crush/pickle now and send ss",
          "drop only emote every time you type on gc/pc for 1 day.",
          "say Welcome to Who Wants To Be a Millionaire! to all the groups you have",
          "call ex saying miss",
          "sing the chorus of the last song you played",
          "vn your ex/crush/girlfriend, says hi (name), wants to call, just a moment. I miss🥺👉🏼👈🏼",
          "Bang on the table (which is at home) until you get scolded for being noisy",
          "Tell random people - I was just told I was your twin first, we separated, then I had plastic surgery. And this is the most ciyusss_ thing",
          "mention ex's name",
          "make 1 rhyme for the members!",
          "send ur whatsapp chat list",
          "chat random people with gheto language then ss here",
          "tell your own version of embarrassing things",
          "tag the person you hate",
          "Pretending to be possessed, for example: possessed by dog, possessed by grasshoppers, possessed by refrigerator, etc.",
          "change name to *I AM DONKEY* for 24 hours",
          "shout *ma chuda ma chuda ma chuda* in front of your house",
          "snap/post boyfriend photo/crush",
          "tell me your boyfriend type!",
          "say *i hv crush on you, do you want to be my girlfriend?* to the opposite sex, the last time you chatted (submit on wa/tele), wait for him to reply, if you have, drop here",
          "record ur voice that read *titar ke age do titar, titar ke piche do titar*",
          "prank chat ex and say *i love u, please come back.* without saying dare!",
          "chat to contact wa in the order according to your battery %, then tell him *i am lucky to hv you!*",
          "change the name to *I am a child of randi* for 5 hours",
          "type in bengali 24 hours",
          "Use selmon bhoi photo for 3 days",
          "drop a song quote then tag a suitable member for that quote",
          "send voice note saying can i call u baby?",
          "ss recent call whatsapp",
          "Say *YOU ARE SO BEAUTIFUL DON'T LIE* to guys!",
          "pop to a group member, and say fuck you",
          "Act like a chicken in front of ur parents",
          "Pick up a random book and read one page out loud in vn n send it here",
          "Open your front door and howl like a wolf for 10 seconds",
          "Take an embarrassing selfie and paste it on your profile picture",
          "Let the group choose a word and a well known song. You have to sing that song and send it in voice note",
          "Walk on your elbows and knees for as long as you can",
          "sing national anthem in voice note",
          "Breakdance for 30 seconds in the sitting room😂",
          "Tell the saddest story you know",
          "make a twerk dance video and put it on status for 5mins",
          "Eat a raw piece of garlic",
          "Show the last five people you texted and what the messages said",
          "put your full name on status for 5hrs",
          "make a short dance video without any filter just with a music and put it on ur status for 5hrs",
          "call ur bestie, bitch",
          "put your photo without filter on ur status for 10mins",
          "say i love oli london in voice note🤣🤣",
          "Send a message to your ex and say I still like you",
          "call Crush/girlfriend/bestie now and screenshot here",
          "pop to one of the group member personal chat and Say you ugly bustard",
          "say YOU ARE BEAUTIFUL/HANDSOME to one of person who is in top of ur pinlist or the first person on ur chatlist",
          "send voice notes and say, can i call u baby, if u r boy tag girl/if girl tag boy",
          "write i love you (random grup member name, who is online) in personal chat, (if u r boy write girl name/if girl write boy name) take a snap of the pic and send it here",
          "use any bollywood actor photo as ur pfp for 3 days",
          "put your crush photo on status with caption, this is my crush",
          "change name to I AM GAY for 5 hours",
          "chat to any contact in whatsapp and say i will be ur bf/gf for 5hours",
          "send voice note says i hv crush on you, want to be my girlfriend/boyfriend or not? to any random person from the grup(if u girl choose boy, if boy choose girl",
          "slap ur butt hardly send the sound of slap through voice note😂",
          "state ur gf/bf type and send the photo here with caption, ugliest girl/boy in the world",
          "shout bravooooooooo and send here through voice note",
          "snap your face then send it here",
          "Send your photo with a caption, i am lesbian",
          "shout using harsh words and send it here through vn",
          "shout you bastard in front of your mom/papa",
          "change the name to i am idiot for 24 hours",
          "slap urself firmly and send the sound of slap through voice note😂",
          "say i love the bot owner Fantox through voice note",
          "send your gf/bf pic here",
          "make any tiktok dance challenge video and put it on status, u can delete it after 5hrs",
          "breakup with your best friend for 5hrs without telling him/her that its a dare",
          "tell one of your frnd that u love him/her and wanna marry him/her, without telling him/her that its a dare",
          "say i love depak kalal through voice note",
          "write i am feeling horny and put it on status, u can delete it only after 5hrs",
          "write i am lesbian and put it on status, u can delete only after 5hrs",
          "kiss your mommy or papa and say i love you😌",
          "put your father name on status for 5hrs",
          "send abusive words in any grup, excepting this grup, and send screenshot proof here",
        ];

        const dareData = dare[Math.floor(Math.random() * dare.length)];

        await Atlas.sendMessage(
          m.from,
          { image: { url: botImage3 }, caption: `*${dareData}*` },
          { quoted: m }
        );
        break;

      case "coinflip":
        await doReact("🧫️")
        let result = Math.floor(Math.random() * 2) + 1;
        if (result === 1) {
          await Atlas.sendMessage(m.from, { text: "Heads" }, { quoted: m });
        } else {
          await Atlas.sendMessage(m.from, { text: "Tails" }, { quoted: m });
        }
        break;

      case "dice":
        await doReact("🎲️")
        let max = parseInt(args[0]);
        if (!max)
          return Atlas.sendMessage(
            m.from,
            { text: "Please provide a maximum number of sides for the dice." },
            { quoted: m }
          );
        let roll = Math.floor(Math.random() * max) + 1;
        Atlas.sendMessage(
          m.from,
          { text: `You rolled a ${roll}!` },
          { quoted: m }
        );
        break;

      case "fact":
        await doReact("🤓")
        await axios
          .get(`https://nekos.life/api/v2/fact`)
          .then((response) => {
            const tet = `*『  Random Facts  』* \n\n${response.data.fact}`;

            Atlas.sendMessage(
              m.from,
              { image: { url: botImage4 }, caption: tet + "\n" },
              { quoted: m }
            );
          })
          .catch((err) => {
            m.reply(`An error occurred.`);
          });
        break;

      case "awesomecheck":
      case "cutecheck":
      case "gaycheck":
      case "greatcheck":
      case "prettycheck":
      case "uglycheck":
      case "staminacheck":
      case "maturecheck":
      case "lesbiancheck":
        if (!text && !m.quoted) {
          await doReact("❌");
          return Atlas.sendMessage(
            m.from,
            { text: `Please tag a user to use this command!` },
            { quoted: m }
          );
        } else if (m.quoted) {
          var mentionedUser = m.quoted.sender;
        } else {
          var mentionedUser = mentionByTag[0];
        }
        await doReact("👀");
        const dey = randomNumberPicker(1, 100);

        let Atlastext = `${
          inputCMD.charAt(0).toUpperCase() + inputCMD.slice(1)
        } Check Of : @${mentionedUser.split("@")[0]}\n\nAnswer : *${dey}%*`;

        Atlas.sendMessage(
          m.from,
          {
            image: { url: botImage3 },
            caption: Atlastext,
            mentions: [mentionedUser],
          },
          { quoted: m }
        );
        break;

      case "charactercheck":
        if (!text && !m.quoted) {
          await doReact("❌");
          return Atlas.sendMessage(
            m.from,
            { text: `Please tag a user to use this command!` },
            { quoted: m }
          );
        } else if (m.quoted) {
          var mentionedUser = m.quoted.sender;
        } else {
          var mentionedUser = mentionByTag[0];
        }
        await doReact("👀");

        const userChar = [
          "Sigma",
          "Generous",
          "Grumpy",
          "Overconfident",
          "Obedient",
          "Good",
          "Simp",
          "Kind",
          "Patient",
          "Pervert",
          "Cool",
          "Helpful",
        ];

        const userCharacterSeletion =
          userChar[Math.floor(Math.random() * userChar.length)];

        let Atlastext4 = `Character Check Of : @${
          mentionedUser.split("@")[0]
        }\n\nAnswer : *${userCharacterSeletion}*`;

        Atlas.sendMessage(
          m.from,
          {
            image: { url: botImage3 },
            caption: Atlastext4,
            mentions: [mentionedUser],
          },
          { quoted: m }
        );
        break;

      default:
        break;
    }
  },
};
