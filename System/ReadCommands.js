import fs from "fs";
import Collections from "./Collections.js";
const commands = new Collections();
commands.prefix = global.prefa;

async function readcommands() {
  const cmdfile = fs
    .readdirSync("./Plugins")
    .filter((file) => file.endsWith(".js"));
  for (const file of cmdfile) {
    try {
      const module = await import(`../Plugins/${file}`);
      const cmdfiles = module.default;
      if (!cmdfiles || !cmdfiles.name) {
        console.warn(`[ ATLAS ] Skipping ${file}: missing default export or name`);
        continue;
      }
      commands.set(cmdfiles.name, cmdfiles);
    } catch (err) {
      console.error(`[ ATLAS ] Failed to load plugin ${file}: ${err.message}`);
    }
  }
}

  export {readcommands, commands};