import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "API key yok", env_keys: Object.keys(process.env).filter(k => k.includes("ANTHROPIC")) });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 50,
        messages: [{ role: "user", content: "Merhaba, test" }],
      }),
    });

    const data = await res.json();
    return NextResponse.json({
      status: res.status,
      key_prefix: apiKey.substring(0, 15),
      key_length: apiKey.length,
      response: data,
    });
  } catch (err) {
    return NextResponse.json({
      error: err.message,
      stack: err.stack?.substring(0, 500),
      name: err.name,
    });
  }
}
