import "../styles/globals.css";
import type { AppProps } from "next/app";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";

TimeAgo.addDefaultLocale(en);

function RetroPatcher({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default RetroPatcher;
