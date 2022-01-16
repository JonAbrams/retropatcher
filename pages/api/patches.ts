import type { NextApiRequest, NextApiResponse } from "next";
import { roms } from "./patches.json";

type Rom = {
  md5: string;
  name: string;
  patches: Patch[];
};

type Patch = {
  name: string;
  patchIps: string;
  originalUrL?: string;
  outputName?: string;
  authorName?: string;
  authorReddit?: string;
  authorTwitter?: string;
};

type ApiError = {
  status: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Patch[] | ApiError>
) {
  const rom = roms.find((rom) => rom.md5 === req.query.md5) as Rom;
  if (!rom) {
    return res.status(404).json({ status: "Rom not found." });
  }

  res.json(rom.patches);
}
