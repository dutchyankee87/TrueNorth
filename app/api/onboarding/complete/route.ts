import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, profiles, openLoops } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { loops } = body;

    const validLoops = (loops as string[] || []).filter((l) => l.trim());

    // Insert open loops if any
    if (validLoops.length > 0) {
      await db.insert(openLoops).values(
        validLoops.map((description) => ({
          userId: user.id,
          description: description.trim(),
          source: "manual",
        }))
      );
    }

    // Ensure profile exists and mark onboarding complete
    const existingProfile = await db.select().from(profiles).where(eq(profiles.id, user.id));

    if (existingProfile.length === 0) {
      await db.insert(profiles).values({
        id: user.id,
        onboardingCompleted: true,
      });
    } else {
      await db
        .update(profiles)
        .set({ onboardingCompleted: true })
        .where(eq(profiles.id, user.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding complete error:", error);
    return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 });
  }
}
