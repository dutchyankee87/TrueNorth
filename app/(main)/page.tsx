import { createClient } from "@/lib/supabase/server";
import { db, guidanceEvents, openLoops, dailyStates } from "@/lib/db";
import { eq, desc, and, gte, lt } from "drizzle-orm";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const [todayGuidance, activeLoops, todayState] = await Promise.all([
    db.select()
      .from(guidanceEvents)
      .where(and(
        eq(guidanceEvents.userId, user.id),
        gte(guidanceEvents.createdAt, todayStart),
        lt(guidanceEvents.createdAt, todayEnd)
      ))
      .orderBy(desc(guidanceEvents.createdAt))
      .limit(1)
      .then(rows => rows[0]),
    db.select()
      .from(openLoops)
      .where(and(
        eq(openLoops.userId, user.id),
        eq(openLoops.status, "open")
      ))
      .limit(5),
    db.select()
      .from(dailyStates)
      .where(and(
        eq(dailyStates.userId, user.id),
        gte(dailyStates.createdAt, todayStart),
        lt(dailyStates.createdAt, todayEnd)
      ))
      .limit(1)
      .then(rows => rows[0]),
  ]);

  const hasCompletedRitual = !!todayGuidance;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="px-6 pt-8 pb-6 lg:px-8 lg:pt-12">
        <div className="max-w-2xl mx-auto lg:max-w-4xl">
          <p className="text-text-muted text-sm">
            {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-2xl lg:text-3xl font-semibold text-text-primary mt-1">
            {hasCompletedRitual ? "Today's Focus" : "Good morning"}
          </h1>
        </div>
      </header>

      <div className="px-6 lg:px-8 space-y-6 lg:space-y-8">
        <div className="max-w-2xl mx-auto lg:max-w-4xl">
          {/* Today's Guidance or Start Ritual CTA */}
          {hasCompletedRitual && todayGuidance ? (
            <div className="bg-white rounded-2xl border border-border p-6 lg:p-8">
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-medium text-accent uppercase tracking-wide">
                  {todayGuidance.guidanceType === "next_action" ? "Next Action" :
                   todayGuidance.guidanceType === "pause" ? "Pause" : "Close Loop"}
                </span>
                <span className="text-xs text-text-muted">
                  {new Date(todayGuidance.createdAt!).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-lg lg:text-xl text-text-primary font-medium leading-relaxed">
                {todayGuidance.guidanceText}
              </p>
              {todayGuidance.reasoning && (
                <p className="text-text-secondary mt-4 text-sm lg:text-base">
                  {todayGuidance.reasoning}
                </p>
              )}
            </div>
          ) : (
            <Link href="/ritual" className="block">
              <div className="bg-accent text-white rounded-2xl p-6 lg:p-8 hover:bg-accent/90 transition-colors">
                <h2 className="text-xl lg:text-2xl font-semibold mb-2">Start your daily ritual</h2>
                <p className="text-white/80">
                  Check in with your state and receive today&apos;s guidance.
                </p>
              </div>
            </Link>
          )}

          {/* Today's State */}
          {todayState && (
            <div className="mt-6 lg:mt-8">
              <h2 className="text-sm font-medium text-text-muted mb-3 lg:mb-4">Today&apos;s State</h2>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                <div className="bg-white rounded-xl border border-border p-3 sm:p-4 text-center">
                  <p className="text-xs text-text-muted mb-1">Mental</p>
                  <p className="text-xs sm:text-sm font-medium text-text-primary capitalize">{todayState.mentalClarity}</p>
                </div>
                <div className="bg-white rounded-xl border border-border p-3 sm:p-4 text-center">
                  <p className="text-xs text-text-muted mb-1">Emotional</p>
                  <p className="text-xs sm:text-sm font-medium text-text-primary capitalize">{todayState.emotionalState}</p>
                </div>
                <div className="bg-white rounded-xl border border-border p-3 sm:p-4 text-center">
                  <p className="text-xs text-text-muted mb-1">Physical</p>
                  <p className="text-xs sm:text-sm font-medium text-text-primary capitalize">{todayState.physicalEnergy}</p>
                </div>
              </div>
            </div>
          )}

          {/* Open Loops */}
          {activeLoops.length > 0 && (
            <div className="mt-6 lg:mt-8">
              <h2 className="text-sm font-medium text-text-muted mb-3 lg:mb-4">Open Loops</h2>
              <div className="bg-white rounded-2xl border border-border divide-y divide-border">
                {activeLoops.map((loop) => (
                  <div key={loop.id} className="p-4 lg:p-5">
                    <p className="text-text-primary">{loop.description}</p>
                    {loop.deadline && (
                      <p className="text-xs text-text-muted mt-1">
                        Due: {new Date(loop.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-6 lg:mt-8 grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
            <Link
              href="/chat"
              className="bg-white rounded-xl border border-border p-3 sm:p-4 lg:p-5 hover:border-accent transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-bg-secondary flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-text-primary text-sm sm:text-base">Chat</p>
                  <p className="text-xs text-text-muted hidden sm:block">Talk it through</p>
                </div>
              </div>
            </Link>
            <Link
              href="/ritual"
              className="bg-white rounded-xl border border-border p-3 sm:p-4 lg:p-5 hover:border-accent transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-bg-secondary flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-text-primary text-sm sm:text-base">Ritual</p>
                  <p className="text-xs text-text-muted hidden sm:block">Daily check-in</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
