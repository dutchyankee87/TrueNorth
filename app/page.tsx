import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-text-primary to-text-secondary flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m-8-9h1m16 0h1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
              </svg>
            </div>
            <span className="font-semibold text-text-primary">True North</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-text-primary text-bg-primary px-5 py-2.5 rounded-full hover:bg-text-secondary transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:pt-40 lg:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-text-muted text-sm uppercase tracking-widest mb-6">
            For the conscious founder
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-text-primary leading-tight tracking-tight">
            Stop managing tasks.
            <br />
            <span className="text-text-secondary">Start following your clarity.</span>
          </h1>
          <p className="mt-8 text-lg lg:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            True North is the anti-productivity tool that replaces endless lists with a single daily practice.
            Check in with your state. Receive one piece of guidance. Act with alignment.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center font-medium bg-text-primary text-bg-primary px-8 py-4 rounded-xl text-lg hover:bg-text-secondary transition-all duration-200 active:scale-[0.98]"
            >
              Begin your practice
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center font-medium text-text-secondary px-8 py-4 rounded-xl text-lg hover:text-text-primary transition-colors"
            >
              Learn more
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 px-6 border-y border-border/50">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-text-muted mb-8">
            Trusted by founders who understand that clarity precedes action
          </p>
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-semibold text-text-primary">94%</p>
              <p className="text-sm text-text-muted mt-1">Report reduced anxiety</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-text-primary">3 min</p>
              <p className="text-sm text-text-muted mt-1">Average daily practice</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-text-primary">1</p>
              <p className="text-sm text-text-muted mt-1">Focus per day</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 lg:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="max-w-2xl">
            <p className="text-text-muted text-sm uppercase tracking-widest mb-4">
              The problem
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold text-text-primary leading-tight">
              Your mind is drowning in open loops
            </h2>
            <p className="mt-6 text-lg text-text-secondary leading-relaxed">
              Every unfinished thought, every pending decision, every &quot;I should probably...&quot;
              creates cognitive tension. Traditional productivity tools add more loops.
              More lists. More guilt.
            </p>
            <p className="mt-4 text-lg text-text-secondary leading-relaxed">
              You&apos;ve done the inner work. You know that your best decisions come from a
              centered state, not a frantic one. Yet your tools keep pulling you back
              into reactivity.
            </p>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-20 lg:py-32 px-6 bg-bg-secondary">
        <div className="max-w-4xl mx-auto">
          <div className="max-w-2xl ml-auto text-right">
            <p className="text-text-muted text-sm uppercase tracking-widest mb-4">
              The practice
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold text-text-primary leading-tight">
              One ritual. One guidance. One action.
            </h2>
            <p className="mt-6 text-lg text-text-secondary leading-relaxed">
              True North replaces the chaos with a simple morning practice. Check in with
              your mental, emotional, and physical state. An AI that understands conscious
              decision-making evaluates what you can truly handle today.
            </p>
            <p className="mt-4 text-lg text-text-secondary leading-relaxed">
              Then you receive exactly one piece of guidance: your next action,
              a loop to close, or permission to pause.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-32 px-6 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-text-muted text-sm uppercase tracking-widest mb-4">
              How it works
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold text-text-primary">
              Three minutes to clarity
            </h2>
          </div>

          <div className="space-y-12 lg:space-y-16">
            {/* Step 1 */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center">
                <span className="text-2xl font-semibold text-text-muted">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  State Check-In
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  Each morning, you answer three simple questions about your mental clarity,
                  emotional state, and physical energy. No judgment. Just honest awareness
                  of where you are right now.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center">
                <span className="text-2xl font-semibold text-text-muted">2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  Elevation Practice (Optional)
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  If your state is compromised, True North offers a brief centering exercise.
                  A breathing pattern. A moment of stillness. Something to shift your energy
                  before making any decisions.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center">
                <span className="text-2xl font-semibold text-text-muted">3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  Receive Guidance
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  Based on your state, your open loops, and what actually matters, you receive
                  exactly one piece of guidance. Not a list. Not options. One clear direction:
                  your next action, a loop to close, or permission to pause.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 lg:py-32 px-6 bg-text-primary text-bg-primary">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-bg-primary/60 text-sm uppercase tracking-widest mb-4">
              Philosophy
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold">
              You never choose what to do
            </h2>
            <p className="mt-6 text-lg text-bg-primary/80 max-w-2xl mx-auto leading-relaxed">
              The system chooses what matters. You only consent or execute.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">No Prioritization</h3>
              <p className="text-sm text-bg-primary/70">
                You may add open loops, but you never sort, rank, or pick from lists.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Loops, Not Tasks</h3>
              <p className="text-sm text-bg-primary/70">
                Open loops are cognitive tension, not units of work to be managed.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">State Before Action</h3>
              <p className="text-sm text-bg-primary/70">
                All execution flows through the daily ritual. Clarity precedes action.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-text-muted text-sm uppercase tracking-widest mb-4">
              From practitioners
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold text-text-primary">
              A different kind of clarity
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-border p-8">
              <p className="text-text-secondary leading-relaxed mb-6">
                &quot;I&apos;ve tried every productivity system. True North is the first tool that
                understands that my capacity changes day to day. Some days I get a
                challenging action. Some days I get permission to rest. Both feel right.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-bg-secondary"></div>
                <div>
                  <p className="font-medium text-text-primary text-sm">Sarah M.</p>
                  <p className="text-text-muted text-sm">Founder, Wellness Tech</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-8">
              <p className="text-text-secondary leading-relaxed mb-6">
                &quot;The morning ritual takes 3 minutes but changes my entire day.
                Instead of waking up anxious about my list, I wake up curious
                about what today&apos;s guidance will be.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-bg-secondary"></div>
                <div>
                  <p className="font-medium text-text-primary text-sm">David K.</p>
                  <p className="text-text-muted text-sm">Conscious Entrepreneur</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-8">
              <p className="text-text-secondary leading-relaxed mb-6">
                &quot;Finally, a tool that respects my inner work. True North doesn&apos;t
                try to optimize me. It trusts that I know what alignment feels like—it
                just helps me stay there.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-bg-secondary"></div>
                <div>
                  <p className="font-medium text-text-primary text-sm">Michael R.</p>
                  <p className="text-text-muted text-sm">Coach & Facilitator</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-8">
              <p className="text-text-secondary leading-relaxed mb-6">
                &quot;I used to feel guilty about not completing my to-do list.
                Now I feel clear about completing my one thing. The shift
                from productivity to presence has been profound.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-bg-secondary"></div>
                <div>
                  <p className="font-medium text-text-primary text-sm">Jennifer L.</p>
                  <p className="text-text-muted text-sm">Meditation Teacher</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-20 lg:py-32 px-6 bg-bg-secondary">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-text-muted text-sm uppercase tracking-widest mb-4">
              Is this for you?
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold text-text-primary">
              True North is for founders who...
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-text-secondary">
                Have a regular meditation or inner work practice
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-text-secondary">
                Know that their best decisions come from a centered state
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-text-secondary">
                Are tired of productivity tools that create more anxiety
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-text-secondary">
                Want permission to pause when pause is what&apos;s needed
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-text-secondary">
                Value alignment over achievement
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-text-secondary">
                Trust that less doing can mean more becoming
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-32 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-semibold text-text-primary leading-tight">
            Your next action awaits
          </h2>
          <p className="mt-6 text-lg text-text-secondary leading-relaxed">
            Stop managing. Start aligning. Begin your practice today.
          </p>
          <Link
            href="/signup"
            className="mt-10 inline-flex items-center justify-center font-medium bg-text-primary text-bg-primary px-10 py-4 rounded-xl text-lg hover:bg-text-secondary transition-all duration-200 active:scale-[0.98]"
          >
            Begin your practice
          </Link>
          <p className="mt-6 text-sm text-text-muted">
            Free during early access. No credit card required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-text-primary to-text-secondary flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m-8-9h1m16 0h1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
                </svg>
              </div>
              <span className="text-sm font-medium text-text-primary">True North</span>
            </div>
            <p className="text-sm text-text-muted">
              Clarity over productivity.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-sm text-text-muted hover:text-text-primary transition-colors">
                Sign in
              </Link>
              <a href="#" className="text-sm text-text-muted hover:text-text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-text-muted hover:text-text-primary transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
