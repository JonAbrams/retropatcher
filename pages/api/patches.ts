import type { NextApiRequest, NextApiResponse } from "next";
import patches from "./patches.json";

export type Rom = {
  md5: string;
  name: string;
  patches: Patch[];
};

export type Patch = {
  patchIps: string;
  authorName: string;
  originalUrl: string;
};

type ApiError = {
  status: string;
};

const { roms } = patches;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Patch[] | ApiError>
) {
  const rom = roms.find((rom) => rom.md5 === req.query.md5) as Rom;
  if (!rom) {
    return res.status(404).json({ status: "No patches found." });
  }

  res.json(rom.patches);
}
