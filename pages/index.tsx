import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import md5 from "js-md5";
import { saveAs } from "file-saver";
import ReactTimeAgo from "react-time-ago";
import { Patch } from "./api/patches";
import { PatchList } from "../components/patchList";
import { PatchInfo } from "../components/patchInfo";
import { applyPatch } from "../lib/ips";
import styles from "../styles/Home.module.css";
import { updated } from "../public/patches/pocket";

const Home: NextPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filenames, setFilenames] = useState<string[]>([]);
  const [filesBytes, setFilesBytes] = useState<Uint8Array[]>([]);
  const [patchInfo, setPatchInfo] = useState<Patch[] | "loading" | null>(null);
  const [errorOutput, setErrorOutput] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (filesBytes.length === 0) return;
    const params = filesBytes.map((f) => `md5=${md5(f)}`).join("&");
    fetch(`/api/patches?${params}`)
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
  }, [filesBytes]);

  const savePatchedFile = (
    filename: string,
    patch: Patch,
    patchedBytes: Uint8Array
  ) => {
    const blob = new Blob([patchedBytes]);
    const matched = filename.match(/(.*)\.gbc?/);
    if (!matched) return;
    let outputFilename = `${matched[1]}.${patch.extension || "pocket"}`;
    if (patch.outputFilename) {
      outputFilename = patch.outputFilename;
    }
    saveAs(blob, outputFilename);
  };

  const handleFilesChosen = async ({
    target,
  }: {
    target: HTMLInputElement;
  }) => {
    setPatchInfo("loading");
    if (!target.files || !target.files.length) {
      setPatchInfo(null);
      setErrorOutput("");
      setFilenames([]);
      setFilesBytes([]);
      return;
    }
    const files = Array.from(target.files);
    setFilenames(files.map((f) => f.name));
    const newFilesBytes: Promise<Uint8Array>[] = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          console.log(md5(new Uint8Array(reader.result as ArrayBuffer)));
          resolve(new Uint8Array(reader.result as ArrayBuffer));
        };
        reader.readAsArrayBuffer(file);
      });
    });
    setFilesBytes(await Promise.all(newFilesBytes));
  };

  const handleApplyPatch = async (patch: Patch) => {
    const fbIndex = filesBytes.findIndex((fb) => md5(fb) === patch.md5);
    const fileBytes = filesBytes[fbIndex];
    const filename = filenames[fbIndex];
    if (!fileBytes) {
      setErrorOutput("Patch and file md5s don't match.");
      return;
    } else {
      setErrorOutput("");
    }
    let url = patch.downloadUrl;
    if (url[0] !== "/") {
      url = `/api/getPatchFile?url=${encodeURIComponent(patch.downloadUrl)}`;
    }
    const patchIps = await fetch(url).then((res) => res.arrayBuffer());
    if (!patchIps) return;
    savePatchedFile(
      filename,
      patch,
      applyPatch(fileBytes, new Uint8Array(patchIps))
    );
  };

  const handleApplyAllPatches = async () => {
    for (const patch of patchInfo as Patch[]) {
      await handleApplyPatch(patch);
    }
  };

  const wrapApplying = (func: { (): Promise<void> }) => {
    return async () => {
      setApplying(true);
      await func();
      setApplying(false);
    };
  };

  const triggerFileInput = () => {
    if (!fileInputRef?.current) return;
    fileInputRef.current.click();
  };

  const notFound = (() => {
    if (!Array.isArray(patchInfo)) return [];
    const roms = [];
    for (let i = 0; i < filesBytes.length; i++) {
      const fmd5 = md5(filesBytes[i]);
      if (!patchInfo.some((p) => p.md5 === fmd5)) {
        roms.push({ filename: filenames[i], md5: fmd5 });
      }
    }
    return roms;
  })();

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
          &apos;s microSD card (place them in a directory called &quot;GB
          Studio&quot;).
        </p>

        <input
          ref={fileInputRef}
          hidden
          accept=".gb,.gbc"
          type="file"
          multiple
          onChange={handleFilesChosen}
        />
        <button className={styles.fileButton} onClick={triggerFileInput}>
          Select GB/GBC rom file(s)
        </button>

        {filesBytes.length > 0 &&
          Array.isArray(patchInfo) &&
          patchInfo.length > 0 && (
            <div className={styles.resultsContainer}>
              <div className={styles.resultsTitle}>
                {patchInfo.length}{" "}
                {patchInfo.length === 1 ? "Patch" : "Patches"} found:
              </div>
              {patchInfo.length > 1 && (
                <div>
                  <button
                    className={styles.downloadButton}
                    onClick={wrapApplying(handleApplyAllPatches)}
                    disabled={applying}
                  >
                    Apply and Save All
                  </button>
                </div>
              )}
              {patchInfo.map((patch) => (
                <PatchInfo
                  patch={patch}
                  key={patch.downloadUrl}
                  onApply={wrapApplying(
                    async () => await handleApplyPatch(patch)
                  )}
                  applying={applying}
                />
              ))}
            </div>
          )}
        {notFound.length > 0 && (
          <div className={styles.resultsContainer}>
            <div className={styles.resultsTitle}>
              Patches not found for these ROMs:
            </div>
            {notFound.map((rom) => (
              <div className={styles.patchInfo} key={rom.filename}>
                <div>Filename: {rom.filename}</div>
                <div>MD5: {rom.md5}</div>
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
