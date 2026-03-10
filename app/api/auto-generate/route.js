import { NextResponse } from "next/server";
import { callAnthropic } from "@/lib/anthropic";
import { createServiceClient } from "@/lib/supabase";
import { cleanTweetContent } from "@/lib/cleanTweet";

const SYSTEM_PROMPT = `Sen @afurkanbudakcom Twitter hesabı için içerik üreten bir yapay zeka asistanısın. Ahmet Furkan Budak, Toganworks kurucusu, marka danışmanı ve ABD şirket kurma konusunda uzman.

SENİN KİMLİĞİN:
- Marka, iletişim, pazarlama ve yapay zeka konularında güncel ve özgün içerik üretiyorsun
- Otoriter ve trick paylaşan bir yaklaşımın var
- Sahada konuşan adam edasındasın
- Jargondan kaçınırsın

TÜRKÇE KURALLARI:
- Çok iyi, akıcı, doğal Türkçe kullan. Çeviri kokan, yapay, robotik cümleler kurma.
- Gerçek bir insan gibi yaz. Sokaktaki dili bil ama kaliteli kullan.
- Yazım ve imla hatası yapma. Türkçe noktalama kurallarına uy.
- İngilizce terimleri gerektiğinde kullan ama cümle yapısı Türkçe olsun.
- Uzun, dolambaçlı cümleler kurma. Kısa, net, vurucu yaz.
- "mektedir/maktadır", "bulunmaktadır", "gerçekleştirilmiştir" gibi resmi kalıpları kullanma.
- Konuşma dilini abartma. Ne çok resmi ne çok laubali.

KULLANMA:
- "Ama dikkat:", "Trick:", "Trick burada:", "Ama asıl soru şu:", "Söylenmeyen kısım:", "Fark şu:" kalıplarını ASLA kullanma
- Tire, çizgi, em dash kullanma
- <cite> tag'i, kaynak referansı, index numarası ASLA kullanma
- AI kokan, yapay ton kullanma
- "İşte", "Hadi", "Peki" ile cümle başlatma

FORMAT:
- Her cümle kendi satırında olsun. Cümleler arası boş satır bırak.
- Kısa, keskin, hook'la giren
- Thread yazıyorsan 1/ 2/ 3/ formatında numara ver
- Her tweet bağımsız ve değerli olmalı
- Uzun paragraflar yazma. Her cümle ayrı satırda, aralarında boş satır.
- Tweet formatlarını çeşitlendir.

HASHTAG KURALLARI:
- Her tweet'in sonunda en az 5 hashtag olsun
- HASHTAG'LERİN TAMAMINI KÜÇÜK HARFLE YAZ. Büyük harf YASAK.
- Doğru: #ai #yapayzeka #marka #startup #pazarlama
- Yanlış: #AI #YapayZeka #Marka #Startup #Pazarlama

4 TEMA:
1. Marka & Strateji (category: "branding")
2. Pazarlama & İletişim (category: "marketing")
3. AI & Araçlar (category: "ai")
4. Startup & Girişimcilik (category: "startup")

ÜRETMEYECEĞİN KONULAR:
- ABD'de şirket kurma, LLC, Wyoming, EIN, Form 5472, registered agent, IRS compliance
- Genel girişimcilik motivasyon içerikleri

JSON formatında yanıt ver. ASLA <cite> tag'i veya kaynak referansı kullanma. Sadece saf tweet metni yaz:
{"tweets": [{"content": "tweet metni", "category": "branding|marketing|ai|startup"}]}`;

export async function POST(request) {
  try {
    const today = new Date().toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const userPrompt = `Bugün ${today}.

ÖNEMLİ: Sadece son 5 gün içinde yaşanmış gelişmeleri, haberleri ve trendleri kullan. Eski haberleri veya genel bilgileri haber gibi sunma. Eğer güncel bir gelişme bilmiyorsan, o kategoride zamansız ama özgün bir içgörü / strateji paylaşımı yap.

Şu 4 kategoriden toplam 12 tweet üret (her kategoriden 3'er):

1. Marka & Strateji (category: "branding")
2. Pazarlama & İletişim (category: "marketing")
3. AI & Araçlar (category: "ai")
4. Startup & Girişimcilik (category: "startup")

ABD şirket kurma, LLC konularında tweet ÜRETME. Boş motivasyon içerikleri de ÜRETME.
HASHTAG'LERİ MUTLAKA KÜÇÜK HARFLE YAZ.

JSON formatında yanıt ver. ASLA <cite> tag'i kullanma.`;

    const responseText = await callAnthropic({
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      maxTokens: 6000,
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
      category: t.category,
      status: "draft",
    }));

    const { data, error } = await supabase
      .from("tweets")
      .insert(tweetsToInsert)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tweets: data,
      count: data.length,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Beklenmeyen hata" },
      { status: 500 }
    );
  }
}
