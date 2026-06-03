import { publicDb } from "@/lib/supabase/public";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await publicDb
    .from("products")
    .select("id, name, categories!inner(name, slug)")
    .ilike("name", "%a%")
    .limit(3);

  return NextResponse.json({ data, error: error?.message || null });
}
