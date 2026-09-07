---
name: frontend-design
description: Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one under src/frontend/. Use this whenever creating or restyling pages, components, or Tailwind styles, to avoid generic/templated "AI-generated" aesthetics.
---

# Frontend Design

> Adapted from Anthropic's official `frontend-design` Claude Code plugin skill
> (see `.github/skills/SOURCES.md` for the exact upstream source and how to
> refresh this file when the upstream skill changes).

Approach every UI task like the design lead at a small studio known for
giving each project a visual identity that couldn't be mistaken for anyone
else's. Make deliberate, opinionated choices about palette, typography, and
layout that are specific to the page's actual content — and be willing to
take one real aesthetic risk you can justify.

## Ground it in the subject

Before designing, pin down: the concrete subject/feature, its audience, and
the page's single job. Reuse the aesthetic direction already established
elsewhere in `src/frontend/` unless there's a reason to introduce a new one
(see the `@frontend-design-expert` agent persona for the list of directions
used in this repo). Build with the real content of the feature, not
placeholder lorem ipsum.

## Design principles

- **Lead with a thesis, not a template.** Open each page/section with the
  most characteristic thing about its subject — a headline, a real number, a
  key action — rather than reaching for the generic "big stat + small label +
  gradient accent" pattern by default.
- **Typography carries personality.** Pair a display face and a body face
  deliberately and set a clear, reused type scale (headings/body/captions).
  Don't just fall back to the Tailwind default sans stack without a reason.
- **Structure should encode information.** Only use structural devices like
  numbered steps (01 / 02 / 03), dividers, or eyebrows when they reflect
  something true about the content (an actual sequence or process) — not as
  decoration.
- **Use motion deliberately, if at all.** Prefer one well-orchestrated
  moment (a page-load sequence, a scroll reveal) over scattered hover
  effects. Excess ambient animation reads as templated/AI-generated.
- **Match complexity to the direction.** A minimal direction needs precision
  in spacing and detail; a maximalist direction needs committed execution.
  Elegance is executing the chosen direction well, not adding more.

## Calibrate against known AI-generated defaults

Current AI-generated frontends cluster around a few recognizable looks: a
warm cream background with a high-contrast serif and a terracotta accent; a
near-black background with a single acid-green or vermilion accent; or a
broadsheet layout with hairline rules, zero border-radius, and dense
newspaper-like columns. These are legitimate for some briefs, but only
choose one because it fits this feature — not by default.

## Process

1. **Brainstorm** a compact token plan before writing code: 4–6 named colors
   (ideally as CSS variables — see `src/frontend/index.css` /
   `tailwind.config.js`), the 1–2 typefaces and roles they serve, and a short
   layout concept.
2. **Critique the plan** against the brief: if any part reads like the
   generic default you'd produce for any similar page, revise it and note
   what changed.
3. **Build** following the revised plan, reusing existing primitives in
   `src/frontend/components/ui/` where they already cover the need.
4. **Critique again**: check responsiveness down to mobile, visible keyboard
   focus states, and that `prefers-reduced-motion` is respected before
   considering the work done.

## Writing/copy in the UI

Treat copy as design material, not filler:

- Name things by what people control (e.g. "notifications"), not by internal
  system names (e.g. "webhook config").
- Default to active voice and keep action names consistent through a flow
  (a "Submit referral" button should produce a "Referral submitted" message,
  not "Success!").
- Errors should state what went wrong and how to fix it, without apologizing
  or being vague.
