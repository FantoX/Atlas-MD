const {checkWelcome}= require('./MongoDB/MongoDb_Core');

module.exports = async (Atlas, anu) => {
  try {
    let metadata = await Atlas.groupMetadata(anu.id);
    let participants = anu.participants;
    let desc = metadata.desc;
    if (desc == undefined) desc = "No Description";

    for (let num of participants) {
      try {
        ppuser = await Atlas.profilePictureUrl(num, "image");
      } catch {
        ppuser = botImage4;
      }

      if (anu.action == "add") {
        const WELstatus = await checkWelcome(anu.id);
        let WAuserName = num;
        console.log(
          `\n+${WAuserName.split("@")[0]} Joined/Got Added in: ${
            metadata.subject
          }\n`
        );
        Atlastext = `
Hello @${WAuserName.split("@")[0]} Senpai,

Welcome to *${metadata.subject}*.

*🧣 Group Description 🧣*

${desc}

*Thank You.*
  `;
        if (WELstatus) {
          await Atlas.sendMessage(anu.id, {
            image: { url: ppuser },
            caption: Atlastext,
            mentions: [num],
          });
        }
      } else if (anu.action == "remove") {
        const WELstatus = await checkWelcome(anu.id);
        let WAuserName = num;
        console.log(
          `\n+${WAuserName.split("@")[0]} Left/Got Removed from: ${
            metadata.subject
          }\n`
        );
        Atlastext = `
  @${WAuserName.split("@")[0]} Senpai left the group.
  `;
        if (WELstatus) {
          await Atlas.sendMessage(anu.id, {
            image: { url: ppuser },
            caption: Atlastext,
            mentions: [num],
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};