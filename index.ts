import { parse } from "https://deno.land/std/flags/mod.ts";
import { parse as parseCsv } from "https://deno.land/std/encoding/csv.ts";
import { Weapon, MarkupTableKey } from "./types.ts";
import { filterObject, capitalize, sectionMarkupGenerator } from "./utils.ts";

const args = parse(Deno.args);
const npcWeapons: Record<string, Weapon> = {};
const playerWeapons: Record<string, Weapon> = {};

// Keys to be used to generate the table
const allowedKeys: MarkupTableKey[] = [
  { label: "Name", isLink: true },
  { label: "Power" },
  { label: "Speed" },
  { label: "Poise Strength" },
  { label: "Crit Chance" },
  { label: "Equip Time (s)" },
  { label: "Quality", isCitation: true },
];

const content = (await parseCsv(await Deno.readTextFile(args.i || args.input), {
  skipFirstRow: true,
})) as Weapon[];

content.forEach((item: Weapon) => {
  const isNpc = item["Path"].split(".")[2] === "npc_weapons";
  const itemType = item["Path"].split(".")[3];

  if (itemType !== "empty" && itemType !== "Tool")
    isNpc
      ? (npcWeapons[capitalize(itemType)] = {
          ...npcWeapons[capitalize(itemType)],
          [item["Name"]]: {
            ...filterObject<Weapon>(item, allowedKeys),
            "Crit Chance": Number(item["Crit Chance"]).toFixed(2)
          },
        })
      : (playerWeapons[capitalize(itemType)] = {
          ...playerWeapons[capitalize(itemType)],
          [item["Name"]]: {
            ...filterObject<Weapon>(item, allowedKeys),
            "Crit Chance": Number(item["Crit Chance"]).toFixed(2)
          },
        });
});

const playerWeaponsMarkup = sectionMarkupGenerator(playerWeapons, allowedKeys);

Deno.writeTextFileSync(args.o || args.output, playerWeaponsMarkup);
console.log("CSV successfully parsed");
