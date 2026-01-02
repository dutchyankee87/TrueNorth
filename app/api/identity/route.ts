import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, identityAnchors } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/identity - Fetch the current user's identity anchor
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch identity anchor for this user
    const result = await db
      .select()
      .from(identityAnchors)
      .where(eq(identityAnchors.userId, user.id));

    // Return null if no identity exists yet (user hasn't completed onboarding)
    const identity = result.length > 0 ? result[0] : null;

    return NextResponse.json({ identity });
  } catch (error) {
    console.error("Identity fetch error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch identity";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}





