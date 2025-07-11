import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const modelsDir = path.join(process.cwd(), "public", "models");
  let files: string[] = [];
  try {
    files = fs.readdirSync(modelsDir).filter((f) => f.endsWith(".glb"));
  } catch (err) {
    return res.status(500).json({ error: "Could not read models directory" });
  }
  res.status(200).json({ models: files });
}
