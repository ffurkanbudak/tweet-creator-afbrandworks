import { NextResponse } from "next/server";
import { postTweet } from "@/lib/twitter";
import { createServiceClient } from "@/lib/supabase";
import { cleanTweetContent } from "@/lib/cleanTweet";

export async function POST(request) {
  try {
    const { tweetId } = await request.json();
    const supabase = createServiceClient();

    // Tweet'i getir
    const { data: tweet, error: fetchError } = await supabase
      .from("tweets")
      .select("*")
      .eq("id", tweetId)
      .single();

    if (fetchError || !tweet) {
      return NextResponse.json(
        { error: "Tweet bulunamadı" },
        { status: 404 }
      );
    }

    // Yayınlamadan önce son bir temizlik yap (güvenlik katmanı)
    const cleanContent = cleanTweetContent(tweet.content);

    // Twitter'a gönder
    const result = await postTweet(cleanContent);

    if (!result.success) {
      return NextResponse.json(
        { error: "Twitter paylaşım hatası" },
        { status: 500 }
      );
    }

    // Durumu güncelle
    const { data: updated, error: updateError } = await supabase
      .from("tweets")
      .update({
        content: cleanContent,
        status: "published",
        published_at: new Date().toISOString(),
        twitter_id: result.tweetId,
      })
      .eq("id", tweetId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tweet: updated,
      twitterResult: result,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Twitter paylaşım hatası" },
      { status: 500 }
    );
  }
}
