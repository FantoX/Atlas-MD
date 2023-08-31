const fs = require("fs");
const Collections = require("./Collections");
const commands = new Collections();
commands.prefix = global.prefa;

 async function readcommands(){
    const cmdfile = fs
      .readdirSync("./Plugins")
      .filter((file) => file.endsWith(".js"));
    for (const file of cmdfile) {
      const cmdfiles = require(`../Plugins/${file}`);
      commands.set(cmdfiles.name, cmdfiles);
    }
  };

  module.exports = {readcommands, commands};