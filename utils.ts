import { MarkupTableKey } from "./types.ts";

export const filterObject = <T>(
  obj: T,
  allowedKeys: MarkupTableKey[]
): Partial<T> =>
  allowedKeys.reduce(
    (acc, key: MarkupTableKey) => ({
      ...acc,
      [key.label]: obj[key.label as keyof T],
    }),
    {}
  );

export const capitalize = (name: string) => {
  const isOneHanded = name.substr(-2) === "1h";
  return `${
    isOneHanded ? "One-handed " : ""
  }${name[0].toUpperCase()}${name.substr(
    1,
    isOneHanded ? name.length - 4 : undefined
  )}`;
};

export const formatMarkupValue = (
  value: string,
  properties?: MarkupTableKey
) => {
  if (properties?.isCitation) return `{{${value}}}`;
  if (properties?.isLink) return `[[${value}]]`;
  return value;
};

export const sectionMarkupGenerator = <T>(
  data: { [key: string]: T },
  allowedKeys: MarkupTableKey[]
): string =>
  Object.entries(data).reduce(
    (acc, [sectionKey, sectionValues]) =>
      acc +
      `\n== ${sectionKey} ==` +
      '\n<div class="mw-collapsible">' +
      '\n{| class="wikitable sortable"' +
      `\n! ${allowedKeys.map(({ label }) => label).join(" !! ")}` +
      tableMarkupGenerator(sectionValues, allowedKeys) +
      "\n|}" +
      "\n</div>\n",
    ""
  );

export const tableMarkupGenerator = <T>(
  data: T,
  allowedKeys?: MarkupTableKey[]
): string =>
  Object.values(data).reduce(
    (acc, currentRow: T) =>
      acc +
      "\n|-" +
      "\n| " +
      Object.entries(currentRow)
        .map(([key, value]) =>
          formatMarkupValue(
            value,
            allowedKeys?.find(({ label }) => key === label)
          )
        )
        .join(" || "),
    ""
  );
