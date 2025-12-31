import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, domains } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { domainNames } = body;

    const validDomains = (domainNames as string[]).filter((d) => d.trim());

    if (validDomains.length === 0) {
      return NextResponse.json({ error: "At least one domain is required" }, { status: 400 });
    }

    await db.insert(domains).values(
      validDomains.map((name) => ({
        userId: user.id,
        name: name.trim(),
      }))
    ).onConflictDoNothing();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Domains save error:", error);
    return NextResponse.json({ error: "Failed to save domains" }, { status: 500 });
  }
}
