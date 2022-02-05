const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fs = require("fs/promises");
const { Base64 } = require("js-base64");
const process = require("process");

const permaPatches = require("./public/patches/permaPocket.json").patches;
const outputFile = "./public/patches/pocket.json";

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
};

(async () => {
  const output = {
    updated: new Date().toISOString(),
    patches: permaPatches,
  };
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
        permaPatches.some(
          (p) =>
            (p.authorName === authorName && p.name === name) ||
            p.downloadUrl === downloadUrl
        )
      ) {
        continue;
      }
      const patch = {
        name,
        authorName,
        downloadUrl,
        md5: md5.toLowerCase(),
        originalUrl:
          authorName === "BestPig"
            ? "https://gist.github.com/BestPig/528fb9a19cbb638fac1278a641041881"
            : mdUrl
                .replace("raw.githubusercontent.com", "github.com")
                .replace("/main", "/blob/main"),
      };
      output.patches.push(patch);
    }
  }

  output.patches.sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    }
    return -1;
  });

  const oldJSON = await fs.readFile(outputFile, "utf8");
  const newJSON = JSON.stringify(output, null, 2) + "\n";

  if (newJSON.length < oldJSON.length) {
    console.error(
      "Uh oh, patches.json got smaller?",
      "Existing file size:",
      oldJSON.length,
      "New size:",
      newJSON.length
    );
    process.exit(2);
  } else if (newJSON.length > oldJSON.length) {
    await fs.writeFile(outputFile, newJSON);
    console.log("Wrote new patches.json");
    process.exit(0); // yay
  }
  console.log("pocket.json didn't seem to change.");
})();
