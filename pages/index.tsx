import type { NextPage } from "next";
import Head from "next/head";
import { ChangeEventHandler, useEffect, useState } from "react";
import md5 from "js-md5";
import { Patch } from "./api/patches";

import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [filename, setFilename] = useState("");
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [patchInfo, setPatchInfo] = useState<Patch | null>(null);
  const [errorOutput, setErrorOutput] = useState("");

  useEffect(() => {
    if (!fileBytes) return;
    fetch(`/api/patches?md5=${md5(fileBytes)}`)
      .then((res) => res.json())
      .then((patchesFromServer) => {
        if (!patchesFromServer[0]) return;
        setPatchInfo(patchesFromServer[0]);
      });
  }, [fileBytes]);

  const handleFileChosen = ({ target }: { target: HTMLInputElement }) => {
    const reader = new FileReader();
    reader.onload = () =>
      setFileBytes(new Uint8Array(reader.result as ArrayBuffer));
    if (!target.files || !target.files.length) return;
    setFilename(target.files[0].name);
    reader.readAsArrayBuffer(target.files[0]);
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

            {patchInfo && (
              <div className={styles.patchInfo}>
                <div>Patch found: {patchInfo.name}</div>
              </div>
            )}
          </div>
        )}
        {errorOutput && <div className={styles.errorOutput}>{errorOutput}</div>}
      </main>

      <footer className={styles.footer}>
        <div>
          Created by <a href="https://twitter.com/JonathanAbrams">Jon Abrams</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
