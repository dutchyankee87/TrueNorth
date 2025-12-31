import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, openLoops, domains } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { description, category, cognitivePull } = await request.json();

    if (!description?.trim()) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    // Try to find matching domain
    let domainId: string | null = null;
    if (category) {
      const existingDomain = await db
        .select()
        .from(domains)
        .where(and(eq(domains.userId, user.id), eq(domains.name, category)))
        .then(rows => rows[0]);

      if (existingDomain) {
        domainId = existingDomain.id;
      } else {
        // Create the domain
        const newDomain = await db
          .insert(domains)
          .values({ userId: user.id, name: category })
          .returning()
          .then(rows => rows[0]);
        domainId = newDomain.id;
      }
    }

    // Create the loop
    const loop = await db
      .insert(openLoops)
      .values({
        userId: user.id,
        domainId,
        description: description.trim(),
        source: "brain_dump",
        cognitivePull: cognitivePull || 3,
      })
      .returning()
      .then(rows => rows[0]);

    return NextResponse.json({ success: true, data: loop });
  } catch (error) {
    console.error("Loop save error:", error);
    const message = error instanceof Error ? error.message : "Failed to save loop";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status"); // optional: "open" or "closed"

    // Fetch loops with their associated domain info
    const loopsQuery = db
      .select({
        id: openLoops.id,
        description: openLoops.description,
        source: openLoops.source,
        commitmentType: openLoops.commitmentType,
        externalParty: openLoops.externalParty,
        deadline: openLoops.deadline,
        cognitivePull: openLoops.cognitivePull,
        status: openLoops.status,
        createdAt: openLoops.createdAt,
        domainId: domains.id,
        domainName: domains.name,
      })
      .from(openLoops)
      .leftJoin(domains, eq(openLoops.domainId, domains.id))
      .where(
        statusFilter
          ? and(eq(openLoops.userId, user.id), eq(openLoops.status, statusFilter))
          : eq(openLoops.userId, user.id)
      );

    const rawLoops = await loopsQuery;

    // Transform to include domain as nested object
    const loops = rawLoops.map((loop) => ({
      id: loop.id,
      description: loop.description,
      source: loop.source,
      commitmentType: loop.commitmentType,
      externalParty: loop.externalParty,
      deadline: loop.deadline,
      cognitivePull: loop.cognitivePull,
      status: loop.status,
      createdAt: loop.createdAt,
      domain: loop.domainId
        ? { id: loop.domainId, name: loop.domainName }
        : null,
    }));

    return NextResponse.json({ loops });
  } catch (error) {
    console.error("Loop fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch loops" }, { status: 500 });
  }
}
