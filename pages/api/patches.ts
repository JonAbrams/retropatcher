import type { NextApiRequest, NextApiResponse } from "next";
import patchesJson from "./patches.json";

export type Patch = {
  md5: string;
  name: string;
  authorName: string;
  originalUrl: string;
  patchIps?: string;
  downloadUrl?: string;
};

export type ApiError = {
  status: string;
};

const patches = (patchesJson as { patches: Patch[] }).patches;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Patch[] | ApiError>
) {
  let results = patches.filter((patch: Patch) => patch.md5 === req.query.md5);
  if (results.length === 0) {
    return res.status(404).json({ status: "No patches found." });
  }

  res.json(results);
}
