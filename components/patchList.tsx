import { useState, ChangeEventHandler } from "react";
import { Patch } from "../pages/api/patches";
import styles from "../styles/Home.module.css";

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
      const results = await fetch(`/api/patches?q=${term}`).then((r) =>
        r.json()
      );
      if (results.status) {
        setErrorOutput(results.status);
        setPatches([]);
        return;
      } else {
        setErrorOutput("");
        setPatches(results);
      }
    }
  };

  return (
    <div className={styles.patchList}>
      <input
        className={styles.searchBox}
        type="search"
        value={searchTerm}
        onChange={handleSearchTerm}
        placeholder="Search patches…"
      />
      {errorOutput && <div className={styles.errorOutput}>{errorOutput}</div>}
      {patches.map((patch) => (
        <div
          className={styles.patchInfo}
          key={patch.downloadUrl}
        >
          <div>{patch.name}</div>
          <div>
            Patch by {patch.authorName}{' '}
            [<a href={patch.originalUrl} target="_blank" rel="noreferrer">url</a>]
          </div>
          <div className={styles.romMd5}>ROM MD5: {patch.md5}</div>
          <div>{patch.downloadUrl && <a href={patch.downloadUrl}>Download Patch</a>}</div>
        </div>
      ))}
    </div>
  );
}