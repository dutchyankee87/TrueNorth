import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, profiles, identityAnchors } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      // Core identity fields
      coreIdentity, 
      primaryConstraint, 
      decisionFilter, 
      antiPatterns, 
      currentPhase,
      // Vision fields (Joe Dispenza inspired)
      futureVision,      // What they want to create in the future
      leavingBehind,     // What they want to leave in the past
      elevatedEmotions,  // Emotions they want to feel more fully
    } = body;

    if (!coreIdentity?.trim()) {
      return NextResponse.json({ error: "Core identity is required" }, { status: 400 });
    }

    // Ensure profile exists
    const existingProfile = await db.select().from(profiles).where(eq(profiles.id, user.id));

    if (existingProfile.length === 0) {
      await db.insert(profiles).values({ id: user.id });
    }

    // Upsert identity anchor with vision fields
    await db
      .insert(identityAnchors)
      .values({
        userId: user.id,
        // Core identity
        coreIdentity: coreIdentity.trim(),
        primaryConstraint: primaryConstraint?.trim() || null,
        decisionFilter: decisionFilter?.trim() || null,
        antiPatterns: antiPatterns ? antiPatterns.split(",").map((p: string) => p.trim()) : null,
        currentPhase: currentPhase?.trim() || null,
        // Vision fields
        futureVision: futureVision?.trim() || null,
        leavingBehind: leavingBehind ? leavingBehind.filter((item: string) => item.trim()).map((p: string) => p.trim()) : null,
        elevatedEmotions: elevatedEmotions ? elevatedEmotions.filter((item: string) => item.trim()).map((p: string) => p.trim()) : null,
      })
      .onConflictDoUpdate({
        target: identityAnchors.userId,
        set: {
          // Core identity
          coreIdentity: coreIdentity.trim(),
          primaryConstraint: primaryConstraint?.trim() || null,
          decisionFilter: decisionFilter?.trim() || null,
          antiPatterns: antiPatterns ? antiPatterns.split(",").map((p: string) => p.trim()) : null,
          currentPhase: currentPhase?.trim() || null,
          // Vision fields
          futureVision: futureVision?.trim() || null,
          leavingBehind: leavingBehind ? leavingBehind.filter((item: string) => item.trim()).map((p: string) => p.trim()) : null,
          elevatedEmotions: elevatedEmotions ? elevatedEmotions.filter((item: string) => item.trim()).map((p: string) => p.trim()) : null,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Identity save error:", error);
    const message = error instanceof Error ? error.message : "Failed to save identity";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
