import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase";
import { cleanTweetContent } from "@/lib/cleanTweet";

const SYSTEM_PROMPT = `Sen @afurkanbudakcom Twitter hesabı için içerik üreten bir yapay zeka asistanısın. Ahmet Furkan Budak, Toganworks kurucusu, marka danışmanı.

SENİN KİMLİĞİN:
- Marka, iletişim, pazarlama ve yapay zeka konularında güncel ve özgün içerik üretiyorsun
- Otoriter ve trick paylaşan bir yaklaşımın var
- Sahada konuşan adam edasındasın
- Jargondan kaçınırsın

TÜRKÇE KURALLARI:
- Doğal, akıcı Türkçe kullan. Çeviri kokan cümleler kurma.
- Kısa, net, vurucu yaz.
- "mektedir/maktadır", "bulunmaktadır" gibi resmi kalıpları kullanma.

KULLANMA:
- "Ama dikkat:", "Trick:", "Trick burada:", "Ama asıl soru şu:", "Söylenmeyen kısım:", "Fark şu:" kalıplarını ASLA kullanma
- Tire, çizgi, em dash kullanma
- <cite> tag'i, kaynak referansı, index numarası ASLA kullanma
- AI kokan, yapay ton kullanma
- "İşte", "Hadi", "Peki" ile cümle başlatma

FORMAT:
- Her cümle kendi satırında olsun. Cümleler arası boş satır bırak.
- Kısa, keskin, hook'la giren
- Her tweet bağımsız ve değerli olmalı

HASHTAG KURALLARI:
- Her tweet'in sonunda en az 5 hashtag olsun
- HASHTAG'LERİN TAMAMINI KÜÇÜK HARFLE YAZ. Büyük harf YASAK.
- Doğru: #ai #yapayzeka #marka #startup #pazarlama
- Yanlış: #AI #YapayZeka #Marka #Startup #Pazarlama

KATEGORİLER:
- ai: Yapay zeka araçları, AI haberleri, prompt teknikleri
- branding: Markalaşma, strateji, guru dersleri
- marketing: Dijital pazarlama, içerik stratejisi, sosyal medya
- startup: Girişimcilik, fonlama, growth

JSON formatında yanıt ver. ASLA <cite> tag'i kullanma. Sadece saf tweet metni yaz:
{"tweets": [{"content": "tweet metni", "category": "kategori"}]}`;

export async function POST(request) {
  try {
    const { topic, category, count } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Anthropic API key tanımlı değil" },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const userPrompt = `"${topic}" konusunda ${count} adet tweet üret. Kategori: ${category}. 

Her tweet 280 karakter altında olsun. Thread olacaksa (280+ karakter) içeriğin tamamını yaz, sistem otomatik böler.

Güncel, keskin, özgün olsun.

HASHTAG'LERİ MUTLAKA KÜÇÜK HARFLE YAZ. #ai #marka #startup gibi. BÜYÜK HARF YASAK.

JSON formatında yanıt ver. ASLA <cite> tag'i kullanma.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });

    // Web search kullanıldığında birden fazla content block olabilir
    let responseText = "";
    for (const block of message.content) {
      if (block.type === "text") {
        responseText += block.text;
      }
    }

    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { error: "AI yanıtı parse edilemedi", raw: responseText },
        { status: 500 }
      );
    }

    // Supabase'e kaydet — her tweet'i temizle
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
