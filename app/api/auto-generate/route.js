import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase";

const SYSTEM_PROMPT = `Sen @afurkanbudakcom Twitter hesabı için içerik üreten bir yapay zeka asistanısın. Ahmet Furkan Budak, Toganworks kurucusu, marka danışmanı ve ABD şirket kurma konusunda uzman.

SENİN KİMLİĞİN:
- Marka, iletişim, pazarlama ve yapay zeka konularında güncel ve özgün içerik üretiyorsun
- Otoriter ve trick paylaşan bir yaklaşımın var
- Sahada konuşan adam edasındasın
- Jargondan kaçınırsın

KULLANMA:
- "Ama dikkat:", "Trick:", "Trick burada:", "Ama asıl soru şu:", "Söylenmeyen kısım:", "Fark şu:" kalıplarını ASLA kullanma
- Tire, çizgi, em dash kullanma
- "değil," kullanma
- "mektedir/maktadır" kalıplarını kullanma
- AI kokan, yapay ton kullanma

FORMAT:
- Kısa, keskin, hook'la giren
- Paragraflar arası boş satır bırak
- Thread yazıyorsan 1/ 2/ 3/ formatında numara ver
- Her tweet bağımsız ve değerli olmalı
- Her tweet'in sonunda en az 5 hashtag olsun. Hashtag'ler tweet'in konusuyla ilgili ve popüler olmalı.
- Hashtag örnekleri: #AI #YapayZeka #ChatGPT #Marka #Branding #Startup #Girişimcilik #Pazarlama #Marketing #LLC #ABD #MarkaStratejisi #DigitalMarketing #ContentMarketing #Entrepreneurship #Tech #OpenAI #Anthropic #Growth #BusinessTips

4 TEMA:
1. AI & Araçlar: Yapay zeka haberleri, yeni araçlar, prompt teknikleri, iş dünyasında AI kullanımı
2. Marka & Strateji: David Aaker, Philip Kotler, Al Ries, Jack Trout, Seth Godin öğretileri. Güncel marka örnekleri
3. Türkiye Girişimcilik: Startup haberleri, ekosistem, fonlama, Forbes listeleri, TÜBİTAK, hızlandırma programları
4. ABD İş Kurma: LLC kurma, Wyoming, EIN, Form 5472, banka hesabı, registered agent, IRS compliance

GURU DERSLERİ:
- David Aaker: Brand equity, 5B çerçevesi, marka kimliği 4 perspektif (ürün, organizasyon, kişi, sembol), brand relevance
- Philip Kotler: 4P'den 4C'ye geçiş, pazarlama ihtiyaçları karşılamaktır, segmentasyon
- Al Ries & Jack Trout: Konumlandırma zihinlerdedir, tek kelimeye sahip ol, kategori yarat
- Seth Godin: Purple cow, herkes için bir şey yapma, kabileler, permission marketing
- Byron Sharp: How Brands Grow, mental availability, fiziksel erişilebilirlik
- Mark Ritson: Marka stratejisi vs taktik, hedef kitle seçimi, fiyatlandırma

JSON formatında yanıt ver:
{"tweets": [{"content": "tweet metni", "category": "ai|branding|turkiye|abd"}]}`;

const NEWS_TOPICS = [
  "AI artificial intelligence tools launch 2026",
  "OpenAI Anthropic Google AI update today",
  "branding strategy marketing trend 2026",
  "Turkey startup investment funding 2026",
  "Türkiye girişim startup yatırım",
  "US LLC business formation compliance",
  "AI marketing automation tools",
  "brand strategy case study 2026",
];

export async function POST(request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Anthropic API key tanımlı değil" },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const today = new Date().toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const userPrompt = `Bugün ${today}.

ÖNEMLİ: Sadece son 5 gün içinde yaşanmış gelişmeleri, haberleri ve trendleri kullan. Eski haberleri veya genel bilgileri haber gibi sunma. Eğer güncel bir gelişme bilmiyorsan, o kategoride zamansız ama özgün bir içgörü / strateji paylaşımı yap.

Şu 4 kategoriden toplam 8 tweet üret (her kategoriden 2'şer):

1. AI & Araçlar (category: "ai")
- Son 5 günde yaşanan bir AI gelişmesi, yeni araç lansmanı, güncelleme
- Ya da güncel bir AI kullanım trick'i / prompt tekniği

2. Marka & Strateji (category: "branding") 
- David Aaker, Kotler, Al Ries, Seth Godin, Byron Sharp veya Mark Ritson'dan bir ders
- Mümkünse son günlerdeki bir marka hamlesiyle bağla

3. Türkiye Girişimcilik (category: "turkiye")
- Son günlerde Türkiye startup ekosisteminde yaşanan gelişmeler
- Ya da Türkiye'deki girişimcilere pratik, zamansız tavsiye

4. ABD İş Kurma (category: "abd")
- LLC kurma, vergi, compliance ile ilgili pratik bilgi
- Türkiye'den ABD'de iş kurmak isteyenlere somut tavsiye

KURALLAR:
- Tarih geçmiş haberler yazma. "X şirketi Y yaptı" diyorsan bu son 5 günde olmuş olmalı.
- Emin olmadığın haberleri uydurma. Bilmiyorsan strateji/içgörü paylaş.
- Tweet'lerin bir kısmı kısa ve keskin (280 karakter altı), bir kısmı thread formatında (daha uzun, 1/ 2/ 3/ numaralı) olsun.

JSON formatında yanıt ver.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 6000,
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

    // Supabase'e kaydet
    const supabase = createServiceClient();
    const tweetsToInsert = parsed.tweets.map((t) => ({
      content: t.content,
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
