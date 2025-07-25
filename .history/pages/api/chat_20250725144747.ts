import type { NextApiRequest, NextApiResponse } from "next";

type ChatCompletionMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatRequestBody = {
  messages: ChatCompletionMessage[];
};

type OpenAIChatResponse = {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  error?: { message: string };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages } = req.body as ChatRequestBody;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid or missing messages" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "OpenAI API key missing" });

  try {
    const chatRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // or "gpt-4" if you have access
        messages,
      }),
    });

    if (!chatRes.ok) {
      const errorData = await chatRes.json();
      return res.status(500).json({ error: errorData.error?.message || "Chat completion failed" });
    }

    const data: OpenAIChatResponse = await chatRes.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      return res.status(500).json({ error: "No response from model" });
    }
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: "Server error: " + (error instanceof Error ? error.message : String(error)) });
  }
}
