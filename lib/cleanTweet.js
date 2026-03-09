/**
 * Tweet içeriğini temizler:
 * - <cite> tag'larını kaldırır
 * - HTML entities decode eder (&amp; &lt; &gt; &quot; &#39; &#x27; vb.)
 * - Fazla boşlukları temizler
 * - Hashtag'leri küçük harfe zorlar
 */
export function cleanTweetContent(text) {
  if (!text) return "";

  let cleaned = text;

  // 1. <cite> tag'larını temizle (web search'ten gelen)
  cleaned = cleaned.replace(/<cite[^>]*>.*?<\/cite>/gs, "");
  cleaned = cleaned.replace(/<cite[^>]*>/g, "");
  cleaned = cleaned.replace(/<\/cite>/g, "");

  // 2. Diğer HTML tag'larını temizle
  cleaned = cleaned.replace(/<[^>]+>/g, "");

  // 3. HTML entities decode et
  const entities = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&#x27;": "'",
    "&#x2F;": "/",
    "&nbsp;": " ",
    "&ndash;": "–",
    "&mdash;": "—",
    "&lsquo;": "'",
    "&rsquo;": "'",
    "&ldquo;": "\u201C",
    "&rdquo;": "\u201D",
    "&hellip;": "...",
    "&trade;": "\u2122",
    "&copy;": "\u00A9",
    "&reg;": "\u00AE",
  };
  for (const [entity, char] of Object.entries(entities)) {
    cleaned = cleaned.replaceAll(entity, char);
  }
  // Numeric HTML entities (&#123; veya &#x1F; gibi)
  cleaned = cleaned.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
    String.fromCodePoint(parseInt(hex, 16))
  );
  cleaned = cleaned.replace(/&#(\d+);/g, (_, dec) =>
    String.fromCodePoint(parseInt(dec, 10))
  );

  // 4. Hashtag'leri küçük harfe zorla
  cleaned = cleaned.replace(/#\w+/g, (tag) => tag.toLowerCase());

  // 5. Fazla boşlukları temizle (ama satır aralarını koru)
  cleaned = cleaned.replace(/[ \t]+/g, " "); // yatay boşlukları tek boşluğa
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n"); // 3+ satır sonu → 2
  cleaned = cleaned.trim();

  return cleaned;
}
