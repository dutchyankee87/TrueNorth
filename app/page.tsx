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
            Meditation-first transformation
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-text-primary leading-tight tracking-tight">
            Become first.
            <br />
            <span className="text-text-secondary">Then do.</span>
          </h1>
          <p className="mt-8 text-lg lg:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            True North is a post-meditation integration tool that helps you embody your future self
            before taking action. Feel the outcome first. Let clarity emerge from coherence.
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
            For founders who understand that being precedes doing
          </p>
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-semibold text-text-primary">10 min</p>
              <p className="text-sm text-text-muted mt-1">Morning practice</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-text-primary">1</p>
              <p className="text-sm text-text-muted mt-1">Embodiment per day</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-text-primary">Coherence</p>
              <p className="text-sm text-text-muted mt-1">Before action</p>
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
              You meditate. Then you react.
            </h2>
            <p className="mt-6 text-lg text-text-secondary leading-relaxed">
              You sit in stillness. You feel expanded. Connected. Clear.
              Then you open your laptop and the old self takes over.
              The anxious one. The reactive one. The one addicted to doing.
            </p>
            <p className="mt-4 text-lg text-text-secondary leading-relaxed">
              The gap between who you are in meditation and who you are in action
              is where transformation dies. Your practice ends when it should begin.
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
              Embody your future. Then act from it.
            </h2>
            <p className="mt-6 text-lg text-text-secondary leading-relaxed">
              True North bridges meditation and action. After coherence breathing,
              you capture what emerged. AI extracts the insights. Then you receive
              one embodiment directive: feel the emotion of your future as already present.
            </p>
            <p className="mt-4 text-lg text-text-secondary leading-relaxed">
              Only then—from that state—do you ask for action guidance.
              Or realize that embodiment was enough.
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
              The morning transformation practice
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
                  Coherence Breathing
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  Begin with heart-brain coherence. 5 seconds in, 5 seconds out.
                  Text overlays guide you: &quot;Becoming no body, no one, no thing, no where, no time.&quot;
                  Optional future-self visualization draws from who you&apos;re becoming.
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
                  Post-Meditation Capture
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  From that elevated state, speak or type what emerged.
                  What wants to be created? What patterns are ready to release?
                  AI extracts open loops, vision updates, and identity insights.
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
                  Embodiment Practice
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  Receive one embodiment directive: &quot;Spend 15 minutes feeling the
                  gratitude of already having closed the Series A.&quot; Feel it in your body.
                  The future becomes present. The nervous system learns safety.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center">
                <span className="text-2xl font-semibold text-text-muted">4</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  Action Emerges (Optional)
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  After embodiment, choose: Get action guidance, or declare yourself complete.
                  Sometimes the inner work was enough. Other days, the right action
                  flows naturally from the state you&apos;ve cultivated.
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
              The body follows the mind&apos;s command
            </h2>
            <p className="mt-6 text-lg text-bg-primary/80 max-w-2xl mx-auto leading-relaxed">
              Inspired by the science of transformation. Feel it first. Become it first. Then act.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Heart-Brain Coherence</h3>
              <p className="text-sm text-bg-primary/70">
                Synchronize your heart and brain before making any decisions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Elevated Emotions</h3>
              <p className="text-sm text-bg-primary/70">
                Gratitude, love, freedom, joy—feel them as the future, not the reward.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Release the Old Self</h3>
              <p className="text-sm text-bg-primary/70">
                Track the patterns you&apos;re leaving behind. The known must be released for the unknown.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Quantum Field Quote */}
      <section className="py-20 lg:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-2xl lg:text-3xl font-light text-text-primary leading-relaxed italic">
            &quot;The best way to predict your future is to create it—not from the known, but from the unknown.&quot;
          </blockquote>
          <p className="mt-6 text-text-muted text-sm uppercase tracking-widest">
            The philosophy behind True North
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-32 px-6 bg-bg-secondary">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-text-muted text-sm uppercase tracking-widest mb-4">
              What you get
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold text-text-primary">
              A complete transformation practice
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-border p-8">
              <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Coherence Timer
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Guided breathing with expanding/contracting visual cues.
                Dispenza-style text overlays. Future HRV integration ready.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-border p-8">
              <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Voice Capture
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Speak your insights from the elevated state.
                Voice often captures what the thinking mind misses.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-border p-8">
              <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                AI Extraction
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Claude extracts open loops, vision updates, identity insights,
                and patterns ready to release from your brain dump.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-border p-8">
              <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Embodiment Guidance
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                One directive: connect an elevated emotion with a concrete outcome.
                Feel it as already happening. 10-20 minutes of becoming.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-border p-8">
              <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Identity Evolution
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Track who you&apos;re becoming, what you&apos;re releasing, and the elevated
                emotions you&apos;re cultivating. Your transformation made visible.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-border p-8">
              <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Optional Action
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                After embodiment, choose action guidance or completeness.
                Sometimes the inner work was enough. That&apos;s honored here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-20 lg:py-32 px-6">
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
                Have a meditation practice but struggle to carry it into their day
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-text-secondary">
                Believe in transformation through elevated emotion, not willpower
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-text-secondary">
                Want to become the person first, then do the things
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-text-secondary">
                Are ready to release old patterns and step into the unknown
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-text-secondary">
                Understand that sometimes embodiment is enough—action can wait
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-text-secondary">
                Trust that the quantum field responds to who you&apos;re being, not what you&apos;re doing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-32 px-6 bg-bg-secondary">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-semibold text-text-primary leading-tight">
            Your future self is waiting
          </h2>
          <p className="mt-6 text-lg text-text-secondary leading-relaxed">
            Not to be chased. To be embodied. To be felt now.
            Begin the practice that bridges meditation and manifestation.
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
              Become first. Then do.
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
