import { checkWelcome } from "./MongoDB/MongoDb_Core.js";

export default async (KAMI, anu) => {
  try {
    const metadata = await KAMI.groupMetadata(anu.id);
    const participants = anu.participants;
    let desc = metadata.desc;
    if (desc == undefined) desc = "No Description";

    for (const numEntry of participants) {
      // Baileys v7 returns participants as objects {id, lid} instead of plain strings
      const num = typeof numEntry === "string" ? numEntry : numEntry.id;
      let ppuser;
      try {
        ppuser = await KAMI.profilePictureUrl(num, "image");
      } catch {
        ppuser = "https://i.imgur.com/MClOeqe.jpeg";
      }

      if (anu.action == "add") {
        const WELstatus = await checkWelcome(anu.id);
        const WAuserName = num;

        const KAMItext = `
Hello @${WAuserName.split("@")[0]} Senpai,

Welcome to *${metadata.subject}*.

*🧣 Group Description 🧣*

${desc}

*Thank You.*
  `;
        if (WELstatus) {
          await KAMI.sendMessage(anu.id, {
            image: { url: ppuser },
            caption: KAMItext,
            mentions: [num],
          });
        }
      } else if (anu.action == "remove") {
        const WELstatus = await checkWelcome(anu.id);
        const WAuserName = num;

        const KAMItext = `
  @${WAuserName.split("@")[0]} Senpai left the group.
  `;
        if (WELstatus) {
          await KAMI.sendMessage(anu.id, {
            image: { url: ppuser },
            caption: KAMItext,
            mentions: [num],
          });
        }
      }
    }
  } catch (err) {
    console.error("[ EXCEPTION ]", err);
  }
};
