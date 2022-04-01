import { useState, ChangeEventHandler, MouseEvent } from "react";
import { Patch } from "../pages/api/patches";
import { PatchInfo } from "./patchInfo";
import styles from "../styles/Home.module.css";

type Results = { status: string } | Patch[];

export function PatchList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patches, setPatches] = useState<Patch[]>([]);
  const [errorOutput, setErrorOutput] = useState("");

  const handleSearchTerm: ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (term.length < 3) {
      setPatches([]);
      setErrorOutput("");
    } else {
      const results = await fetch(
        `/api/patches?q=${encodeURIComponent(term)}`
      ).then((r) => r.json());
      setResults(results);
    }
  };

  const handleStartChar = async (event: MouseEvent, char: string) => {
    event.preventDefault();
    setSearchTerm("");
    const results = (await fetch(
      `/api/patches?startsWith=${encodeURIComponent(char.toLowerCase())}`
    ).then((r) => r.json())) as Results;
    setResults(results);
  };

  const setResults = (results: Results) => {
    if (Array.isArray(results)) {
      setErrorOutput("");
      setPatches(results);
    } else {
      setErrorOutput(results.status);
      setPatches([]);
    }
  };

  const alphaList = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className={styles.patchList}>
      <input
        className={styles.searchBox}
        type="search"
        value={searchTerm}
        onChange={handleSearchTerm}
        placeholder="Search patches…"
      />
      <div className={styles.alphaList}>
        {alphaList.map((char) => (
          <a
            key={char}
            href={"#" + char}
            onClick={(e) => handleStartChar(e, char)}
          >
            {char}
          </a>
        ))}
      </div>
      {errorOutput && <div className={styles.errorOutput}>{errorOutput}</div>}
      {patches.map((patch) => (
        <PatchInfo
          patch={patch}
          key={`${patch.md5}:${patch.downloadUrl}`}
          showDownload
          showMd5
        />
      ))}
    </div>
  );
}
