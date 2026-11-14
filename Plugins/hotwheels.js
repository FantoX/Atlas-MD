let mergedCommands = ["hotwheels","hw"];

export default {

name:"hotwheels",
alias:[...mergedCommands],
uniquecommands:[...mergedCommands],
description:"Get random Hot Wheels",

start: async (KAMI,m,{inputCMD})=>{

switch(inputCMD){

case "hotwheels":
case "hw":

try{

const res = await fetch("https://hot-wheels-rugs.onrender.com/api/random")
const data = await res.json()

const image = data.imgUrl

await KAMI.sendMessage(
m.from,
{
image:{url:image},
caption:`🏎 KAMI-MD Hot Wheels

Name: ${data.name}
Model: ${data.model}
Series: ${data.series}
Year: ${data.year}`
},
{ quoted:m }
)

}catch(e){

await KAMI.sendMessage(
m.from,
{ text:"❌ KAMI-MD failed to fetch Hot Wheels."},
{ quoted:m }
)

}

break

default:
break

}

}

}