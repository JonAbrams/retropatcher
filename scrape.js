const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { writeFileSync } = require("fs");
const { Base64 } = require("js-base64");

const githubMdSources = {
  JoseJX: {
    md: "https://raw.githubusercontent.com/JoseJX/analogue-pocket-patches/main/README.md",
  },
  Infinest: {
    md: "https://raw.githubusercontent.com/jduckett95/infinest-pocket-patches/main/README.md",
  },
  treyturner: {
    md: "https://raw.githubusercontent.com/treyturner/analogue-pocket-patches/main/README.md",
  },
  jsky0: {
    md: "https://raw.githubusercontent.com/jsky0/analogue-pocket-patches/main/README.md",
  },
};

const bestBigSrc =
  "https://gist.githubusercontent.com/BestPig/528fb9a19cbb638fac1278a641041881/raw/75b5236f40a9128c4de28e892bae41ebe99afc2c/analogue-pocket-game-patches.md";

(async () => {
  const output = {
    updated: new Date().toISOString(),
    roms: [],
  };
  for (const authorName of Object.keys(githubMdSources)) {
    const url = githubMdSources[authorName].md;
    const text = await fetch(url).then((res) => res.text());
    const chunks = text.split(/^##?\s*/m);
    for (let chunk of chunks) {
      const match = chunk.match(
        /[#\s]*(?<name>.*)[^]*MD5[^0-9a-f]*(?<md5>[0-9a-f]{32})[^]*(?<url>https:\/\/[^)]*)/i
      );
      if (!match) continue;
      const name = match.groups.name;
      const md5 = match.groups.md5.toLowerCase();
      const downloadUrl = match.groups.url;
      if (!name || !md5 || !downloadUrl) continue;
      const rom = {
        name,
        md5,
        authorName,
        originalUrl: url
          .replace("raw.githubusercontent.com", "github.com")
          .replace("/main", "/blob/main"),
      };
      console.log("Fetching IPS for", name);
      const buffer = await fetch(downloadUrl).then((res) => res.arrayBuffer());
      rom.patchIps = Base64.fromUint8Array(new Uint8Array(buffer));
      output.roms.push(rom);
    }
  }
  // bestpig parsing
  const text = await fetch(bestBigSrc).then((res) => res.text());
  const chunks = text.split(/^#+\s*/m);
  for (let chunk of chunks) {
    const match = chunk.match(
      /^(?<name>.*)[^]*(?<url>https:\/\/.*ips)[^]*MD5.*(?<md5>[0-9a-f]{32})/i
    );
    if (!match) continue;
    const { name, md5, url } = match.groups;
    const rom = {
      name,
      md5: md5.toLowerCase(),
      authorName: "BestPig",
      originalUrl:
        "https://gist.github.com/BestPig/528fb9a19cbb638fac1278a641041881",
    };
    console.log("Fetching IPS for", name);
    const downloadUrl = url.replace(
      "shareit.bestpig.fr/file",
      "shareit.bestpig.fr/get"
    );
    const buffer = await fetch(downloadUrl).then((res) => res.arrayBuffer());
    rom.patchIps = Base64.fromUint8Array(new Uint8Array(buffer));
    output.roms.push(rom);
  }

  output.roms.sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    }
    return -1;
  });
  writeFileSync("public/patches.json", JSON.stringify(output, null, 2) + "\n", {
    encoding: "utf8",
  });
})();
