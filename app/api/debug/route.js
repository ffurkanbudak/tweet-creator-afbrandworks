import { NextResponse } from "next/server";

export async function GET() {
  const anthropicKey = process.env.ANTHROPIC_API_KEY || "YOK";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "YOK";
  
  return NextResponse.json({
    anthropic_key_prefix: anthropicKey.substring(0, 15) + "...",
    anthropic_key_length: anthropicKey.length,
    anthropic_key_ends_with: anthropicKey.substring(anthropicKey.length - 5),
    supabase_url: supabaseUrl,
    has_supabase_anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    has_service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}
