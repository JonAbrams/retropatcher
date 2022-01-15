import "../styles/globals.css";
import type { AppProps } from "next/app";

function RetroPatcher({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default RetroPatcher;
