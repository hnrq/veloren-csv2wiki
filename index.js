import { parse } from "https://deno.land/std/flags/mod.ts";
import { parse as parseCsv } from "https://deno.land/std/encoding/csv.ts";

const args = parse(Deno.args);
const npcWeapons = {};
const playerWeapons = {};

const capitalize = (name) => {
  const isOneHanded = name.substr(-2) === "1h";
  return `${
    isOneHanded ? "One-handed " : ""
  }${name[0].toUpperCase()}${name.substr(
    1,
    isOneHanded ? name.length - 4 : undefined
  )}`;
};

const getQualityColor = (quality) => {
  switch (quality) {
    case "Moderate":
      return "Green";
    case "High":
      return "Blue";
    case "Epic":
      return "Purple";
    case "Legendary":
      return "Yellow";
    default:
      return "Grey";
  }
};

const content = await parseCsv(await Deno.readTextFile(args.i || args.input), {
  skipFirstRow: true,
});

content.forEach((item) => {
  const isNpc = item["Path"].split(".")[2] === "npc_weapons";
  const itemType = item["Path"].split(".")[3];

  if (itemType !== "empty")
    isNpc
      ? (npcWeapons[capitalize(itemType)] = {
          ...npcWeapons[capitalize(itemType)],
          [item["Name"]]: {
            ...item,
          },
        })
      : (playerWeapons[capitalize(itemType)] = {
          ...playerWeapons[capitalize(itemType)],
          [item["Name"]]: {
            ...item,
          },
        });
});

const playerWeaponsMarkup = Object.entries(playerWeapons).reduce(
  (acc, [weaponsType, weapons]) =>
    acc +
    `\n== ${weaponsType} ==` +
    '\n<div class="mw-collapsible">' +
    '\n{| class="wikitable sortable"' +
    "\n! Name !! Power !! Speed !! Quality Color !! Quality" +
    Object.values(weapons).reduce(
      (weaponAcc, weapon) =>
        weaponAcc +
        "\n|-" +
        `\n| [[${weapon["Name"]}]] || ${weapon["Power"]} || ${
          weapon["Speed"]
        } || ${getQualityColor(weapon["Quality"])} || {{${weapon["Quality"]}}}`,
      ""
    ) +
    "|}" +
    "</div>",
  "",
  ""
);

console.log();

Deno.writeTextFileSync(args.o || args.output, playerWeaponsMarkup);
