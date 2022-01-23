import type { NextApiRequest, NextApiResponse } from "next";
import patchesJson from "./patches.json";

export type Patch = {
  md5: string;
  name: string;
  patchIps: string;
  authorName: string;
  originalUrl: string;
};

type ApiError = {
  status: string;
};

const roms = (patchesJson as { roms: Patch[] }).roms;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Patch | ApiError>
) {
  const patch = roms.find((rom: Patch) => rom.md5 === req.query.md5);
  if (!patch) {
    return res.status(404).json({ status: "No patches found." });
  }

  res.json(patch);
}
