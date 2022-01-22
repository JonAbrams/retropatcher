import type { NextPage } from "next";
import Head from "next/head";
import { ChangeEventHandler, useEffect, useState } from "react";
import md5 from "js-md5";
import { Base64 } from "js-base64";
import { saveAs } from "file-saver";
import { Patch } from "./api/patches";
import { applyPatch } from "../lib/ips";

import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [filename, setFilename] = useState("");
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [patchedBytes, setPatchedBytes] = useState<Uint8Array | null>(null);
  const [patchInfo, setPatchInfo] = useState<Patch | "loading" | null>(null);
  const [errorOutput, setErrorOutput] = useState("");

  useEffect(() => {
    if (!fileBytes) return;
    fetch(`/api/patches?md5=${md5(fileBytes)}`)
      .then((res) => res.json())
      .then((patchesFromServer) => {
        if (patchesFromServer.status) {
          setErrorOutput(patchesFromServer.status);
          setPatchInfo(null);
          return;
        }
        if (!patchesFromServer[0]) return;
        // TODO: Support multiple patches?
        setPatchInfo(patchesFromServer[0]);
        setErrorOutput("");
      });
  }, [fileBytes]);

  useEffect(() => {
    if (!patchedBytes || !filename) return;
    const blob = new Blob([patchedBytes]);
    const matched = filename.match(/(.*)\.gbc?/);
    if (!matched) return;
    saveAs(blob, matched[1] + ".pocket");
    setPatchedBytes(null);
  }, [filename, patchedBytes]);

  const handleFileChosen = ({ target }: { target: HTMLInputElement }) => {
    setPatchInfo("loading");
    const reader = new FileReader();
    reader.onload = () =>
      setFileBytes(new Uint8Array(reader.result as ArrayBuffer));
    if (!target.files || !target.files.length) {
      setPatchInfo(null);
      setErrorOutput("");
      setFilename("");
      setFileBytes(null);
      return;
    }
    setFilename(target.files[0].name);
    reader.readAsArrayBuffer(target.files[0]);
  };

  const handleApplyPatch = () => {
    if (!fileBytes || !patchInfo || patchInfo === "loading") return;
    const ipsAsArray = Base64.toUint8Array(patchInfo.patchIps);
    setPatchedBytes(applyPatch(fileBytes, ipsAsArray));
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Retro Patcher</title>
        <meta name="description" content="Easily patch your retro games!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Retro Patcher</h1>
        <p>Convert gb/gbc roms into Analogue Pocket compatible roms.</p>

        <form className={styles.fileChooser}>
          <input accept=".gb,.gbc" type="file" onChange={handleFileChosen} />
        </form>
        {fileBytes && (
          <div className={styles.fileInfo}>
            <div>Name: {filename}</div>
            <div>MD5: {md5(fileBytes)}</div>

            {patchInfo === "loading" && <div>Looking for a patch…</div>}
            {patchInfo && typeof patchInfo !== "string" && (
              <div className={styles.patchInfo}>
                <div>
                  <strong>Patch found!</strong>
                </div>
                <div>
                  Created by {patchInfo.authorName} [
                  <a
                    href={patchInfo.originalUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    url
                  </a>
                  ]
                </div>
                <button
                  className={styles.downloadButton}
                  onClick={handleApplyPatch}
                >
                  Apply and Save
                </button>
                <p className={styles.note}>
                  {
                    'Note: Clicking "Apply and Save" will let you "download" the \
                  patched ROM, but the patching and downloading all occurs on \
                  your device.'
                  }
                </p>
              </div>
            )}
          </div>
        )}
        {errorOutput && <div className={styles.errorOutput}>{errorOutput}</div>}
      </main>

      <footer className={styles.footer}>
        <div>
          Created by <a href="https://twitter.com/JonathanAbrams">Jon Abrams</a>{" "}
          [
          <a
            href="https://github.com/JonAbrams/retropatcher"
            target="_blank"
            rel="noreferrer"
          >
            github
          </a>
          ]
        </div>
      </footer>
    </div>
  );
};

export default Home;
