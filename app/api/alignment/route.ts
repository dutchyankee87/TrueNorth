import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, guidanceEvents, identityAnchors, openLoops } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/alignment
 * 
 * Fetches the user's recent guidance history and identity anchor
 * to show their "alignment actions" — steps toward becoming their future self.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch identity anchor (includes vision and elevated emotions)
    const identityResult = await db
      .select()
      .from(identityAnchors)
      .where(eq(identityAnchors.userId, user.id));

    const identity = identityResult.length > 0 ? identityResult[0] : null;

    // Fetch recent guidance events (last 7 days worth, max 10)
    const recentGuidance = await db
      .select({
        id: guidanceEvents.id,
        guidanceType: guidanceEvents.guidanceType,
        guidanceText: guidanceEvents.guidanceText,
        reasoning: guidanceEvents.reasoning,
        referencedLoopId: guidanceEvents.referencedLoopId,
        createdAt: guidanceEvents.createdAt,
      })
      .from(guidanceEvents)
      .where(eq(guidanceEvents.userId, user.id))
      .orderBy(desc(guidanceEvents.createdAt))
      .limit(10);

    // Get the most recent guidance (today's action)
    const todaysGuidance = recentGuidance.length > 0 ? recentGuidance[0] : null;

    // Fetch open loops count for context
    const openLoopsResult = await db
      .select()
      .from(openLoops)
      .where(eq(openLoops.userId, user.id));
    
    const openLoopsCount = openLoopsResult.filter(l => l.status === "open").length;

    return NextResponse.json({
      identity,
      todaysGuidance,
      recentGuidance,
      openLoopsCount,
    });
  } catch (error) {
    console.error("Alignment fetch error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch alignment data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


