# True North

## Philosophy

This is an **anti-productivity tool** for founders. The core principle:

> The user never chooses what to do. The system chooses what matters. The user only consents or executes.

Each morning: check-in → optional elevation practice → ONE output (Next Action, Pause, or Close Loop).

## Hard Rules (Never Violate)

1. **No user-driven prioritization** - Users may add/edit/archive loops, but NEVER sort, rank, reorder, or pick from lists
2. **Open loops are cognitive tension, NOT tasks** - They are attention leaks, not units of work
3. **Landscape View is read-only** - No checkboxes, no completion affordances, no drag-and-drop
4. **All execution flows through the Daily Ritual** - No "work from here" buttons anywhere else
5. **Mobile-first, desktop-companion** - PWA is primary; desktop handles admin only

## Language

- Say "open loop" not "task" or "todo"
- Say "guidance" not "recommendation" or "suggestion"
- Say "close loop" not "complete" or "finish"
- Avoid productivity language: "optimize", "maximize", "efficient", "productive"

## Architecture

```
Daily Ritual Flow:
State Check-in → State Gate (Haiku) → [Elevation Practice] → Guidance Engine (Sonnet) → ONE Output
```

- **State Gate**: Evaluates if user can make good decisions (uses Claude Haiku)
- **Guidance Engine**: Generates exactly ONE directive (uses Claude Sonnet)
- **Elevation Practices**: Brief centering exercises when state is compromised

## Tech Stack

- Next.js 14+ (App Router)
- Supabase (PostgreSQL + Auth)
- Anthropic Claude API (Sonnet for reasoning, Haiku for classification)
- Tailwind CSS
- TypeScript

## Design Principles

- **Austere, calming** - meditation app aesthetic, not productivity tool
- **Generous whitespace** - when in doubt, remove visual elements
- **Large touch targets** - minimum 48px
- **Subtle animations only** - 300ms fades, no bounces
- **No dark mode** - intentionally light and calming

## Key Files

- `lib/llm/prompts.ts` - All LLM system prompts
- `lib/llm/state-gate.ts` - State evaluation logic
- `lib/llm/guidance-engine.ts` - Guidance generation
- `components/ritual/` - All ritual flow components
- `supabase/schema.sql` - Database schema with RLS

## Database Notes

- Uses Supabase Auth with RLS policies tied to `auth.uid()`
- `profiles` table created automatically via trigger on user signup
- Type assertions (`as any`) used for Supabase queries due to generic typing
