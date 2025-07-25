import type { NextApiRequest, NextApiResponse } from "next";

type Dalle2ApiResponse = {
  data: Array<{ url: string }>;
  error?: { message: string };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "OpenAI API key missing" });

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
      const errorData = await dalleRes.json();
      return res.status(500).json({ error: errorData.error?.message || "Image generation failed" });
    }

    const data: Dalle2ApiResponse = await dalleRes.json();

    if (data.data && data.data[0]?.url) {
      return res.status(200).json({ imageUrl: data.data[0].url });
    } else {
      return res.status(500).json({ error: "Image generation failed" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Server error: " + (error instanceof Error ? error.message : String(error)) });
  }
}
