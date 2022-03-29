import fetch from "node-fetch";
import fs from "fs/promises";
import process from "process";

const outputFile = "./public/patches/pocket.js";

const sources = {
  JoseJX: {
    md: "https://raw.githubusercontent.com/JoseJX/analogue-pocket-patches/main/README.md",
  },
  Infinest: {
    md: "https://raw.githubusercontent.com/jduckett95/infinest-pocket-patches/main/README.md",
  },
  "Trey Turner": {
    md: "https://raw.githubusercontent.com/treyturner/analogue-pocket-patches/main/README.md",
  },
  jsky0: {
    md: "https://raw.githubusercontent.com/jsky0/analogue-pocket-patches/main/README.md",
  },
  r0r0: {
    md: "https://raw.githubusercontent.com/jduckett95/misc-pocket-patches/main/r0r0-patches.md",
  },
  BestPig: {
    md: "https://gist.githubusercontent.com/BestPig/528fb9a19cbb638fac1278a641041881/raw/analogue-pocket-game-patches.md",
  },
  reminon: {
    md: "https://raw.githubusercontent.com/reminon/pocket-patches/main/README.md",
  },
};

(async () => {
  const permaPatchesText = await fs.readFile(
    "./public/patches/permaPocket.json"
  );
  const patches = JSON.parse(permaPatchesText).patches;
  for (const authorName of Object.keys(sources)) {
    const mdUrl = sources[authorName].md;
    const text = await fetch(mdUrl).then((res) => res.text());
    const chunks = text.split(/^#+\s*/m);
    const regex =
      authorName === "BestPig"
        ? /^(?<name>.*)[^]*(?<url>https:\/\/.*\.ips)[^]*MD5.*(?<md5>[0-9a-f]{32})/i
        : /^(?<name>.*)[^]*MD5.*(?<md5>[0-9a-f]{32})[^]*(?<url>https:\/\/.*\.ips)/i;
    for (let chunk of chunks) {
      const match = chunk.match(regex);
      if (!match) continue;
      const { name, md5, url } = match.groups;
      if (!name || !md5 || !url) continue;
      const downloadUrl =
        authorName === "BestPig"
          ? url.replace("shareit.bestpig.fr/file", "shareit.bestpig.fr/get")
          : url.replace("/blob/main/", "/raw/main/");
      if (
        patches.some(
          (p) =>
            (p.authorName === authorName && p.name === name) ||
            p.downloadUrl === downloadUrl
        )
      ) {
        continue;
      }
      const hashName = name
        .trim()
        .replace(/[^-\s\wÀ-ú]/g, "")
        .replace(/\s/g, "-")
        .toLowerCase();
      const patch = {
        name,
        authorName,
        downloadUrl,
        md5: md5.toLowerCase(),
        extension: 'pocket',
        originalUrl:
          (authorName === "BestPig"
            ? "https://gist.github.com/BestPig/528fb9a19cbb638fac1278a641041881"
            : mdUrl
                .replace("raw.githubusercontent.com", "github.com")
                .replace("/main", "/blob/main"))+`#${hashName}`,
      };
      patches.push(patch);
    }
  }

  patches.sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    }
    return -1;
  });

  const newJSON = JSON.stringify(patches, null, 2);
  let outputText = `export const updated = '${new Date().toISOString()}';\n`;
  outputText += `export const patches = ${newJSON};\n`;
  const oldText = await fs.readFile(outputFile, { encoding: "utf8" });
  if (outputText.length > oldText.length) {
    await fs.writeFile(outputFile, outputText);
    console.log("Wrote new pocket.js");
  } else if (outputText.length < oldText.length) {
    console.error(
      "Uh oh, patches.json got smaller?",
      "Existing file size:",
      oldText.length,
      "New size:",
      outputText.length
    );
    process.exit(1);
  }
})();
