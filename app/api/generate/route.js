import { NextResponse } from "next/server";
import { callAnthropic } from "@/lib/anthropic";
import { createServiceClient } from "@/lib/supabase";
import { cleanTweetContent } from "@/lib/cleanTweet";

const SYSTEM_PROMPT = `Sen @afurkanbudakcom Twitter hesabı için içerik üreten bir yapay zeka asistanısın.

KURALLAR:
- Doğal, akıcı Türkçe kullan. Kısa, net, vurucu yaz.
- <cite> tag'i, kaynak referansı ASLA kullanma
- HASHTAG'LERİN TAMAMINI KÜÇÜK HARFLE YAZ. Büyük harf YASAK.
- Her tweet'in sonunda en az 5 hashtag olsun

JSON formatında yanıt ver:
{"tweets": [{"content": "tweet metni", "category": "kategori"}]}`;

export async function POST(request) {
  try {
    const { topic, category, count } = await request.json();

    const userPrompt = `"${topic}" konusunda ${count} adet tweet üret. Kategori: ${category}.
Her tweet 280 karakter altında olsun.
HASHTAG'LERİ KÜÇÜK HARFLE YAZ.
JSON formatında yanıt ver. ASLA <cite> tag'i kullanma.`;

    const responseText = await callAnthropic({
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      maxTokens: 4000,
    });

    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { error: "AI yanıtı parse edilemedi", raw: responseText.substring(0, 500) },
        { status: 500 }
      );
    }

    const supabase = createServiceClient();
    const tweetsToInsert = parsed.tweets.map((t) => ({
      content: cleanTweetContent(t.content),
      category: t.category || category,
      status: "draft",
    }));

    const { data, error } = await supabase
      .from("tweets")
      .insert(tweetsToInsert)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tweets: data, count: data.length });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Beklenmeyen hata" },
      { status: 500 }
    );
  }
}
