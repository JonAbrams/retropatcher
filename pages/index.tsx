import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import md5 from "js-md5";
import { Base64 } from "js-base64";
import { saveAs } from "file-saver";
import { Patch } from "./api/patches";
import { applyPatch } from "../lib/ips";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const updated = Date.now();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState("");
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [patchedBytes, setPatchedBytes] = useState<Uint8Array | null>(null);
  const [patchInfo, setPatchInfo] = useState<Patch[] | "loading" | null>(null);
  const [errorOutput, setErrorOutput] = useState("");
  const [applying, setApplying] = useState(false);

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
        setPatchInfo(patchesFromServer);
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

  const handleApplyPatch = async (patch: Patch) => {
    if (!fileBytes) return;
    let patchIps;
    if (patch.downloadUrl) {
      setApplying(true);
      patchIps = await fetch(
        `/api/getPatchFile?url=${encodeURIComponent(patch.downloadUrl)}`
      ).then((res) => res.arrayBuffer());
    } else if (patch.patchIps) {
      patchIps = Base64.toUint8Array(patch.patchIps);
    }
    setApplying(false);
    if (!patchIps) return;
    setPatchedBytes(applyPatch(fileBytes, new Uint8Array(patchIps)));
  };

  const triggerFileInput = () => {
    if (!fileInputRef?.current) return;
    fileInputRef.current.click();
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

        <input
          ref={fileInputRef}
          hidden
          accept=".gb,.gbc"
          type="file"
          onChange={handleFileChosen}
        />
        <button className={styles.fileButton} onClick={triggerFileInput}>
          Select GB/GBC rom file
        </button>

        {fileBytes && (
          <div className={styles.fileInfo}>
            <div>ROM File Name: {filename}</div>
            <div>MD5: {md5(fileBytes)}</div>

            {patchInfo === "loading" && <div>Looking for a patch…</div>}
            {patchInfo &&
              typeof patchInfo !== "string" &&
              patchInfo.map((patch) => (
                <div key={patch.name} className={styles.patchInfo}>
                  <div>
                    <div>Patch Name: {patch.name}</div>
                    Created by {patch.authorName} [
                    <a
                      href={patch.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      url
                    </a>
                    ]
                  </div>
                  <button
                    className={styles.downloadButton}
                    onClick={() => handleApplyPatch(patch)}
                    disabled={applying}
                  >
                    Apply and Save
                  </button>
                </div>
              ))}
          </div>
        )}
        {errorOutput && <div className={styles.errorOutput}>{errorOutput}</div>}
        <div className={styles.updated}>
          Patch list updated:{" "}
          {Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(updated))}
        </div>
        <p className={styles.note}>
          {
            'Note: This site will let you "download" the \
                  patched ROM, but the patching and downloading all occurs on \
                  your device, no copyrighted content is sent or received. No warranty provided, use at your own risk. \
                  All patches listed '
          }
          <a
            href="https://strt-slct.com/analogue-pocket-patches/"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
          .
        </p>
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
        <div>
          Patches created by JoseJX, BestPig, Infinest, jsky0, Trey Turner, and
          r0r0.
        </div>
      </footer>
    </div>
  );
};

export default Home;
