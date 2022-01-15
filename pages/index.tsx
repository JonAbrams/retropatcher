import type { NextPage } from "next";
import Head from "next/head";
import { ChangeEventHandler, useState } from "react";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [md5sum, setmd5sum] = useState();

  const processFile = (file: ArrayBuffer) => {
    console.log({ file });
  };

  const handleFileChosen = ({ target }: { target: HTMLInputElement }) => {
    const reader = new FileReader();
    reader.onload = () => processFile(reader.result as ArrayBuffer);
    if (!target.files || !target.files.length) return;
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

        <form>
          <input accept=".gb,.gbc" type="file" onChange={handleFileChosen} />
        </form>
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
