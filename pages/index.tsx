import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import md5 from "js-md5";
import { saveAs } from "file-saver";
import ReactTimeAgo from "react-time-ago";
import { Patch } from "./api/patches";
import { PatchList } from "../components/patchList";
import { applyPatch } from "../lib/ips";
import styles from "../styles/Home.module.css";
import { updated } from "../public/patches/pocket";

const Home: NextPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState("");
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
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

  function savePatchedFile(patch: Patch, patchedBytes: Uint8Array) {
    const blob = new Blob([patchedBytes]);
    const matched = filename.match(/(.*)\.gbc?/);
    if (!matched) return;
    let outputFilename = `${matched[1]}.${patch.extension || 'pocket'}`;
    if (patch.outputFilename) {
      outputFilename = patch.outputFilename;
    }
    saveAs(blob, outputFilename);
  }

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
    setApplying(true);
    let url = patch.downloadUrl;
    if (url[0] !== "/") {
      url = `/api/getPatchFile?url=${encodeURIComponent(patch.downloadUrl)}`;
    }
    const patchIps = await fetch(url).then((res) => res.arrayBuffer());
    setApplying(false);
    if (!patchIps) return;
    savePatchedFile(patch, applyPatch(fileBytes, new Uint8Array(patchIps)));
  };

  const triggerFileInput = () => {
    if (!fileInputRef?.current) return;
    fileInputRef.current.click();
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Retro Patcher</title>
        <meta
          name="description"
          content="Easily patch your GB/GBC roms to run on an Analogue Pocket."
        />
        <meta
          name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Retro Patcher</h1>
        <p>
          Easily patch your GB/GBC roms to run on an{" "}
          <a href="https://analogue.co/pocket" target="_blank" rel="noreferrer">
            Analogue Pocket
          </a>
          &apos;s microSD card (in a directory called &quot;GB Studio&quot;).
        </p>

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
          <ReactTimeAgo date={new Date(updated)} locale="en-US" />
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
        <PatchList />
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
