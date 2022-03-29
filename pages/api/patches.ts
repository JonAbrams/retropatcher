import type { NextApiRequest, NextApiResponse } from "next";
import { patches } from "../../public/patches/pocket";

export type Patch = {
  md5: string;
  name: string;
  authorName: string;
  originalUrl: string;
  downloadUrl: string;
  outputFilename?: string;
  extension?: string;
};

export type ApiError = {
  status: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Patch[] | ApiError>
) {
  let results = [] as Patch[];
  if (req.body.md5s) {
    results = patches.filter((patch: Patch) =>
      req.body.md5s.includes(patch.md5)
    );
  } else if (!Array.isArray(req.query.q) && req.query.q?.length >= 3) {
    const q = req.query.q.toLowerCase();
    results = patches.filter(
      (patch: Patch) =>
        patch.name.toLowerCase().replace(/é/g, "e").indexOf(q) > -1 ||
        patch.authorName.toLowerCase().indexOf(q) > -1
    );
  } else if (req.query.startsWith?.[0].match(/[#a-z]/)) {
    const startsWith =
      req.query.startsWith[0] === "#"
        ? /^[^a-zA-z]/
        : new RegExp(`^${req.query.startsWith[0]}`);
    results = patches.filter((patch: Patch) =>
      patch.name.toLowerCase().match(startsWith)
    );
  }

  res.json(results);
}
