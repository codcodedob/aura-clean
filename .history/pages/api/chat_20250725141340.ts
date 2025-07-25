import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { messages } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Missing OPENAI_API_KEY");
    return res.status(500).json({ error: "Missing API key" });
  }

  try {
    const openAIres = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
      }),
    });

    const data = await openAIres.json();

    if (!openAIres.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({ error: data.error?.message || "OpenAI error" });
    }

    res.status(200).json({ reply: data.choices[0]?.message?.content ?? "" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
