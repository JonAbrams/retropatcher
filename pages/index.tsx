import type { NextPage } from "next";
import Head from "next/head";
import { ChangeEventHandler, useState } from "react";
import styles from "../styles/Home.module.css";
import md5 from "js-md5";

const Home: NextPage = () => {
  const [filename, setFilename] = useState("");
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [patchInfo, setPatchInfo] = useState();

  const handleFileChosen = ({ target }: { target: HTMLInputElement }) => {
    const reader = new FileReader();
    reader.onload = () => setFileBytes(reader.result as ArrayBuffer);
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
        {fileBytes ? (
          <div className={styles.fileInfo}>
            <div>Name: {filename}</div>
            <div>MD5: {md5(fileBytes)}</div>

            {patchInfo ? (
              <div className={styles.patchInfo}>Patch Info</div>
            ) : (
              <div className={styles.patchNotFound}>Patch not found</div>
            )}
          </div>
        ) : (
          ""
        )}
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
