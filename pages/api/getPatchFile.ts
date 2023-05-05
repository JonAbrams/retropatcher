import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import { patches } from "../../public/patches/pocket";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Buffer | string>
) {
  console.log(req.headers.host);
  let url = req.query.url;
  if (typeof url !== "string" || !patches.some((p) => p.downloadUrl === url)) {
    return res.status(404).send("No patches found.");
  }

  const result = await fetch(url);
  if (result.status !== 200) {
    res.status(result.status).send(`Failed to get patch file from ${url}`);
    return;
  }
  const fileBuffer = await result.arrayBuffer();
  res.send(Buffer.from(fileBuffer));
}
