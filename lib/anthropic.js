/**
 * Anthropic API wrapper — SDK yerine fetch kullanır.
 * Vercel serverless ortamında SDK bağlantı sorunu yaşandığı için
 * doğrudan HTTP API kullanıyoruz.
 */
export async function callAnthropic({ system, messages, tools, maxTokens = 6000 }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY tanımlı değil");

  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system,
    messages,
  };

  if (tools && tools.length > 0) {
    body.tools = tools;
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Anthropic API error: ${res.status}`);
  }

  const data = await res.json();

  // Text bloklarını birleştir (web search kullanıldığında birden fazla olabilir)
  let responseText = "";
  for (const block of data.content) {
    if (block.type === "text") {
      responseText += block.text;
    }
  }

  return responseText;
}
