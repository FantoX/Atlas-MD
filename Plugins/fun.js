import axios from "axios";

let mergedCommands = ["truth", "dare", "coinflip", "dice", "fact"];

export default {
  name: "fun",
  alias: [...mergedCommands],
  uniquecommands: ["truth", "dare", "coinflip", "dice", "fact"],
  description: "All fun Commands",
  start: async (
    KAMI,
    m,
    { text, args, prefix, inputCMD, mentionedJid, mentionByTag, doReact },
  ) => {
    function randomNumberPicker(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
    switch (inputCMD) {
      case "truth":
        await doReact("🤔");
        const truth = [
          "What is your biggest fear?",
          "Have you ever lied to get out of trouble?",
          "What is the most embarrassing thing you've ever done?",
          "Have you ever kept a secret from your best friend?",
          "What is a habit you have that you think is weird?",
          "Who is your secret crush?",
          "What's the worst lie you've ever told?",
          "Have you ever cheated on a test?",
          "What's the most childish thing you still do?",
          "Have you ever peed in the pool?",
          "What is the most awkward text you've ever sent?",
          "If you could trade places with someone for a day, who would it be?",
          "What is the scariest dream you have ever had?",
          "Have you ever broken something and blamed it on someone else?",
          "What's the longest you've gone without brushing your teeth?",
          "What's a secret you've never told anyone?",
          "Who in this group do you think is the smartest?",
          "Have you ever ghosted someone?",
          "What is your worst habit?",
          "Have you ever laughed at an inappropriate time?",
          "What's your biggest regret in life?",
          "Do you sing in the shower? If so, what?",
          "Have you ever snooped through someone else's phone?",
          "What was the most awkward romantic moment of your life?",
          "Have you ever skipped school?",
          "Who was your first crush?",
          "What is your silliest fear?",
          "Have you ever practiced kissing in the mirror?",
          "What is the most embarrassing nickname you've ever had?",
          "What is the most annoying thing about your best friend?",
          "Have you ever felt jealous of a friend? Why?",
          "Have you ever accidentally sent a text to the wrong person?",
          "What is the grossest thing you've ever eaten?",
          "Who is the most annoying person you know?",
          "What's a trend you followed that you now regret?",
          "Have you ever faked an illness to get out of an event?",
          "What is the strangest dream you've had about someone in this group?",
          "Who do you think is the best looking in this group?",
          "What is the worst gift you have ever received?",
          "Have you ever cried while watching a movie? Which one?",
          "What is a song you secretly love but pretend to hate?",
          "If you had to delete one app from your phone, what would it be?",
          "What is the most time you've spent on social media in a day?",
          "Have you ever dropped food on the floor and eaten it?",
          "What is your biggest insecurity?",
          "Have you ever tried to look cool and completely failed?",
          "What is the weirdest thing you do when you are alone?",
          "Who was your worst teacher and why?",
          "Have you ever eavesdropped on a private conversation?",
          "What is the most trouble you've ever been in?",
          "What was your most embarrassing outfit?",
          "Have you ever laughed so hard you cried?",
          "What is a lie you told that escalated way too far?",
          "Have you ever stolen anything?",
          "Who is the last person you searched for on Instagram?",
          "What is the worst date you've ever been on?",
          "Have you ever used someone for your own gain?",
          "Who is someone you pretend to like but actually don't?",
          "What is the most embarrassing thing your parents have caught you doing?",
          "What's the strangest thing you've ever bought?",
          "Have you ever ruined a surprise party?",
          "What's the silliest reason you ever got mad at someone?",
          "What is your worst texting habit?",
          "Who do you text the most?",
          "What is the weirdest thing in your room?",
          "Have you ever had a crush on a fictional character?",
          "What is something you do that you think nobody else does?",
          "Have you ever accidentally liked an old photo of someone you were stalking?",
          "Who in this group makes you laugh the most?",
          "What is the dumbest thing you ever believed as a child?",
          "Have you ever shoplifted?",
          "What's your weirdest shower thought?",
          "What is a phobia you have that is completely irrational?",
          "If you could only eat one food for the rest of your life, what would it be?",
          "What's the most embarrassing thing you've texted to your crush?",
          "Have you ever had a paranormal experience?",
          "Who is the one person you regret dating?",
          "What was the biggest rumor spread about you?",
          "Have you ever spread a rumor about someone else?",
          "What is something you're glad your family doesn't know about you?",
          "Do you have a hidden talent? What is it?",
          "Have you ever completely forgotten what you were talking about mid-sentence?",
          "Have you ever fallen asleep in public?",
          "What is the longest you've ever stayed awake?",
          "What's the weirdest food combination you enjoy?",
          "If you won the lottery tomorrow, what's the first thing you would buy?",
          "What is a movie you've watched more than 5 times?",
          "Have you ever cried to get out of a speeding ticket or trouble?",
          "What's the strangest rumor you've heard about yourself?",
          "Have you ever snuck out of the house?",
          "What's the worst thing you ever said to someone?",
          "Who would you call to help you bury a body?",
          "Do you ever talk to yourself in the mirror?",
          "Have you ever lied about your age?",
          "What is your guiltiest pleasure?",
          "If your life was a movie, what would the title be?",
          "Have you ever pretended to be sick to stay home?",
          "What is something you do that annoys people?",
          "Have you ever tripped and fallen in public? What happened?",
          "Who do you secretly stalk on social media?",
          "What's the most ridiculous thing you've bought online?",
        ];
        const truthData = truth[Math.floor(Math.random() * truth.length)];

        await KAMI.sendMessage(
          m.from,
          { image: { url: botImage3 }, caption: `*${truthData}*` },
          { quoted: m },
        );
        break;

      case "dare":
        await doReact("😎");
        const dare = [
          "Do a silly dance for 30 seconds.",
          "Let someone write a word on your forehead.",
          "Eat a raw slice of onion.",
          "Try to juggle 3 items of the group's choosing.",
          "Speak in a weird accent for the next 3 rounds.",
          "Let the group look through your photo gallery for 1 minute.",
          "Post a completely random and meaningless status right now.",
          "Send a strange emoji to the 5th person in your contacts.",
          "Bark like a dog for 10 seconds.",
          "Try to lick your elbow.",
          "Hold your breath for 15 seconds.",
          "Call a random number and sing Happy Birthday.",
          "Let someone tickle you for 30 seconds.",
          "Eat a spoonful of hot sauce.",
          "Draw a mustache on your face with a pen.",
          "Wear your socks on your hands for the next 10 minutes.",
          "Talk without closing your mouth for the next 2 rounds.",
          "Spin around 10 times and then try to walk in a straight line.",
          "Let the group give you a funny new nickname and call you by it.",
          "Act like a monkey until it's your turn again.",
          "Send an 'I love you' text to a random contact.",
          "Take a selfie making the ugliest face possible and post it.",
          "Hold a plank position for 30 seconds.",
          "Do 20 jumping jacks.",
          "Smell the inside of someone else's shoe.",
          "Gulp down a glass of water without using your hands.",
          "Let someone style your hair in a weird way.",
          "Try to breakdance.",
          "Speak entirely in rhyme for the next 5 minutes.",
          "Eat a spoonful of mustard.",
          "Only use sign language for the next round.",
          "Recite the alphabet backwards.",
          "Balance a spoon on your nose for 10 seconds.",
          "Keep your eyes closed until your next turn.",
          "Sing everything you say for the next 3 rounds.",
          "Try doing the worm.",
          "Try to touch your toes without bending your knees for 30 seconds.",
          "Talk to an imaginary friend for 1 minute.",
          "Act like a statue for 1 minute.",
          "Try to sneeze on command.",
          "Say the alphabet aloud while doing squats.",
          "Eat a slice of lemon without making a face.",
          "Brush your teeth with mustard.",
          "Let someone else type a message and send it from your phone.",
          "Put ice cubes in your shirt for 1 minute.",
          "Pretend to be a waiter and take everyone's 'order'.",
          "Attempt to do a cartwheel.",
          "Act like a robot for the next 5 minutes.",
          "Put your clothes on backward.",
          "Act like you are swimming on the floor.",
          "Attempt to do 10 pushups.",
          "Sing a song as loudly as you can.",
          "Let someone draw on your arm with a pen.",
          "Hold hands with the person next to you for 3 rounds.",
          "Stand on one leg for 1 minute.",
          "Try to touch your nose with your tongue.",
          "Read the last text you received out loud.",
          "Make up a poem about the person to your left.",
          "Call your mom and tell her you love her.",
          "Pretend you are an airplane for 1 minute.",
          "Try to whistle a popular song.",
          "Eat a mixture of ketchup and mayonnaise.",
          "Speak with your tongue sticking out for the next round.",
          "Try to catch an imaginary fly.",
          "Pretend you're a weather reporter and give a dramatic forecast.",
          "Act like an old person for the next 5 minutes.",
          "Let someone blindfold you and feed you something out of the fridge.",
          "Try to say a tongue twister 5 times fast.",
          "Tell a really bad dad joke.",
          "Pretend to cry for 30 seconds.",
          "Dance with a broomstick or mop.",
          "Give a dramatic reading of a random article.",
          "Call a friend and speak completely in gibberish.",
          "Wear a funny hat for the rest of the game.",
          "Pretend to be an alien communicating with humans for the first time.",
          "Put on a blindfold and try to guess what an object is.",
          "Mime being trapped in a box.",
          "Roar like a lion as loudly as you can.",
          "Pretend you are a superhero and explain your origin story.",
          "Go outside and yell 'I believe in fairies!'.",
          "Try to balance a book on your head and walk across the room.",
          "Act out your favorite movie scene.",
          "Speak in an extremely high-pitched voice.",
          "Talk like a pirate for the next 3 statements.",
          "Pretend to be a cat and purr at someone.",
          "Give a 1-minute speech on why the sky is blue.",
          "Walk backward for the next 5 minutes.",
          "Do your best impression of a famous celebrity.",
          "Act like you have a hairball.",
          "Let the group choose an object for you to sell to them.",
          "Pretend to ride a horse around the room.",
          "Lay on the floor and act like a sizzling piece of bacon.",
          "Eat a handful of dry oats.",
          "Pretend to be a baby until your next turn.",
          "Let someone put an ice cube down your back.",
          "Give someone a piggyback ride.",
          "Try to lick your toes.",
          "Do 15 sit-ups.",
          "Talk as if you are underwater for 2 minutes.",
          "Let the group wrap you in toilet paper.",
          "Do an impression of a baby crying.",
        ];

        const dareData = dare[Math.floor(Math.random() * dare.length)];

        await KAMI.sendMessage(
          m.from,
          { image: { url: botImage3 }, caption: `*${dareData}*` },
          { quoted: m },
        );
        break;

      case "coinflip":
        await doReact("🧫️");
        let result = Math.floor(Math.random() * 2) + 1;
        if (result === 1) {
          await KAMI.sendMessage(m.from, { text: "Heads" }, { quoted: m });
        } else {
          await KAMI.sendMessage(m.from, { text: "Tails" }, { quoted: m });
        }
        break;

      case "dice":
        await doReact("🎲️");
        let max = parseInt(args[0]);
        if (!max)
          return KAMI.sendMessage(
            m.from,
            { text: "Please provide a maximum number of sides for the dice." },
            { quoted: m },
          );
        let roll = Math.floor(Math.random() * max) + 1;
        KAMI.sendMessage(
          m.from,
          { text: `You rolled a ${roll}!` },
          { quoted: m },
        );
        break;

      case "fact":
        await doReact("🤓");
        try {
          const response = await axios.get(`https://nekos.life/api/v2/fact`);
          const tet = `*『  Random Facts  』* \n\n${response.data.fact}`;
          await KAMI.sendMessage(
            m.from,
            { image: { url: botImage4 }, caption: tet + "\n" },
            { quoted: m },
          );
        } catch (err) {
          await m.reply(`An error occurred.`);
        }
        break;

      default:
        break;
    }
  },
};
