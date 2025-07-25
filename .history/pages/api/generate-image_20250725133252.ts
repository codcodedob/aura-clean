import { NextApiRequest, NextApiResponse } from "next";

// Explicit type for DALL·E API image response
type DalleImageResponse = {
  data: { url: string }[];
  error?: { message: string };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  const apiKey = process.env.OPENAI_API_KEY;
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

  const data = (await dalleRes.json()) as DalleImageResponse;

  if (data.data && data.data[0]?.url) {
    res.status(200).json({ imageUrl: data.data[0].url });
  } else {
    res.status(500).json({ error: "Image generation failed" });
  }
}
