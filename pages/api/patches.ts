import type { NextApiRequest, NextApiResponse } from "next";
import { patches } from "../../public/patches/pocket";

export type Patch = {
  md5: string;
  name: string;
  authorName: string;
  originalUrl: string;
  downloadUrl: string;
};

export type ApiError = {
  status: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Patch[] | ApiError>
) {
  let results = [] as Patch[];
  if (req.query.md5) {
    results = patches.filter((patch: Patch) => patch.md5 === req.query.md5);
  } else if (req.query.q?.length >= 3) {
    const q = req.query.q as string;
    results = patches.filter(
      (patch: Patch) => patch.name.toLowerCase().indexOf(q.toLowerCase()) > -1
    );
  }

  if (results.length === 0) {
    return res.status(404).json({ status: "No patches found." });
  }

  res.json(results);
}
