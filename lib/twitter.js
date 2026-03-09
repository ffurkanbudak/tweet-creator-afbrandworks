import { TwitterApi } from "twitter-api-v2";

export function createTwitterClient() {
  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });
}

export async function postTweet(content) {
  const client = createTwitterClient();
  const rwClient = client.readWrite;

  // 280 karakter altındaysa tek tweet
  if (content.length <= 280) {
    const result = await rwClient.v2.tweet(content);
    return { success: true, tweetId: result.data.id, type: "single" };
  }

  // 280 üstündeyse thread olarak paylaş
  const chunks = splitIntoThread(content);
  const tweets = [];

  for (let i = 0; i < chunks.length; i++) {
    const options = i === 0 ? {} : { reply: { in_reply_to_tweet_id: tweets[i - 1].data.id } };
    const result = await rwClient.v2.tweet(chunks[i], options);
    tweets.push(result);
  }

  return {
    success: true,
    tweetId: tweets[0].data.id,
    type: "thread",
    threadIds: tweets.map((t) => t.data.id),
  };
}

function splitIntoThread(content) {
  // Paragraf bazlı böl
  const paragraphs = content.split("\n\n").filter((p) => p.trim());
  const chunks = [];
  let current = "";

  for (const para of paragraphs) {
    const test = current ? current + "\n\n" + para : para;
    if (test.length <= 275) {
      current = test;
    } else {
      if (current) chunks.push(current);
      // Tek paragraf 280'i aşıyorsa cümle bazlı böl
      if (para.length > 275) {
        const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
        let sentenceBuf = "";
        for (const s of sentences) {
          const sTest = sentenceBuf ? sentenceBuf + " " + s.trim() : s.trim();
          if (sTest.length <= 275) {
            sentenceBuf = sTest;
          } else {
            if (sentenceBuf) chunks.push(sentenceBuf);
            sentenceBuf = s.trim();
          }
        }
        current = sentenceBuf;
      } else {
        current = para;
      }
    }
  }
  if (current) chunks.push(current);

  // Thread numarası ekle
  if (chunks.length > 1) {
    return chunks.map((c, i) => `${i + 1}/${chunks.length} ${c}`);
  }
  return chunks;
}
