import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractIdentity, extractVision, extractDomains, extractLoops } from "@/lib/llm";

/**
 * POST /api/onboarding/extract
 * 
 * Extracts structured data from brain dump text.
 * Called during onboarding to transform free-form writing into structured fields.
 * 
 * Body:
 * - type: "identity" | "vision" | "domains" | "loops"
 * - brainDump: string (the user's free-form text)
 * 
 * Returns extracted structured data for user confirmation before saving.
 */
export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { type, brainDump } = body;

    // Validate inputs
    const validTypes = ["identity", "vision", "domains", "loops"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Type must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    if (!brainDump?.trim()) {
      return NextResponse.json(
        { error: "Brain dump text is required" },
        { status: 400 }
      );
    }

    // Extract based on type
    switch (type) {
      case "identity": {
        const extracted = await extractIdentity(brainDump);
        return NextResponse.json({ extracted });
      }
      case "vision": {
        const extracted = await extractVision(brainDump);
        return NextResponse.json({ extracted });
      }
      case "domains": {
        const extracted = await extractDomains(brainDump);
        return NextResponse.json({ extracted });
      }
      case "loops": {
        const extracted = await extractLoops(brainDump);
        return NextResponse.json({ extracted });
      }
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Extraction error:", error);
    const message = error instanceof Error ? error.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

