// pages/api/generate-image.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing OpenAI API Key" });

  try {
    const dalleRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: "512x512",
        model: "dall-e-2",
      }),
    });

    if (!dalleRes.ok) {
      const errText = await dalleRes.text();
      return res.status(500).json({ error: `OpenAI error: ${errText}` });
    }

    const data = await dalleRes.json();

    if (data.data && data.data[0]?.url) {
      return res.status(200).json({ imageUrl: data.data[0].url });
    } else {
      return res.status(500).json({ error: "Image generation failed", details: data });
    }
  } catch (error) {
    return res.status(500).json({ error: (error as any).message || "Unknown error" });
  }
}
