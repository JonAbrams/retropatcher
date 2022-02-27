import { Patch } from "../pages/api/patches";
import styles from "../styles/Home.module.css";

interface PatchInfoProps {
  patch: Patch;
  applying?: boolean;
  showMd5?: boolean;
  showDownload?: boolean;
  onApply?: () => {};
}

export function PatchInfo({
  patch,
  applying,
  showDownload,
  showMd5,
  onApply,
}: PatchInfoProps) {
  return (
    <div className={styles.patchInfo} key={patch.name}>
      <div>
        {patch.name} by{" "}
        <a href={patch.originalUrl} target="_blank" rel="noreferrer">
          {patch.authorName}
        </a>
      </div>
      {showMd5 && <div>ROM MD5: {patch.md5}</div>}
      {showDownload && <a href={patch.downloadUrl}>Download patch</a>}
      {onApply && (
        <button
          className={styles.downloadButton}
          onClick={onApply}
          disabled={applying}
        >
          Apply and Save
        </button>
      )}
    </div>
  );
}
