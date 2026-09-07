# Frontend Design Skills — Sources & Update Guide

This repo is explicit about where its Copilot **skills** under
`.github/skills/` come from, so they can be kept in sync as upstream
projects evolve.

## Where these skills came from

The starting point was the curated list in
[wilwaldon/Claude-Code-Frontend-Design-Toolkit](https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit)
(referenced from the issue that added this directory). That repository is a
**README-only curated list** of links to Claude Code skills/plugins hosted in
*other* repositories — it does not itself contain any installable
`SKILL.md` files. To bring the toolkit's ideas into this repo for GitHub
Copilot's [agent skills](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills)
feature (`.github/skills/<name>/SKILL.md`), each skill listed below was
**ported and adapted** (not copied verbatim, since the upstream skills are
authored under their own, sometimes unclear, licenses) from its true
upstream source, with attribution:

| Skill in this repo | Adapted from | Upstream path |
| --- | --- | --- |
| `.github/skills/frontend-design/SKILL.md` | [anthropics/claude-code](https://github.com/anthropics/claude-code) — the "Frontend Design (Official)" entry, listed first in the toolkit's Design Skills section | `plugins/frontend-design/skills/frontend-design/SKILL.md` (upstream commit [`423563c`](https://github.com/anthropics/claude-code/commit/423563cfe38c90fdf3b428cff0ee7f51cfec3ca7), fetched 2026-08-28) |

The toolkit lists many more skills (Design Tokens, UI/UX Pro Max, Taste
Skill, Bencium UX Designer, Tailwind kits, etc.). Only the flagship
"install this first" skill has been ported so far. If you want additional
skills from the toolkit ported into `.github/skills/`, open a
[🧰 Add a Boilerplate Feature](../ISSUE_TEMPLATE/boilerplate_feature.yml)
issue naming the skill and its upstream source.

## How to update

The upstream toolkit list and the individual skill repos it points to are
updated periodically and independently of this repo. To refresh:

1. Re-check the toolkit README for changes:
   `https://raw.githubusercontent.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit/main/README.md`
   — look for new entries, removed entries, or a different "install this
   first" recommendation.
2. For each skill already ported here (see the table above), fetch the
   current upstream `SKILL.md` (e.g.
   `https://raw.githubusercontent.com/anthropics/claude-code/main/plugins/frontend-design/skills/frontend-design/SKILL.md`)
   and diff it against `.github/skills/<name>/SKILL.md` in this repo.
3. Re-apply the same adaptation approach used originally: rewrite the
   guidance in this repo's own words (do not paste upstream text verbatim),
   keep it scoped to `src/frontend/` conventions already in place (existing
   `components/ui/` primitives, Tailwind config, `index.css` tokens), and
   update the upstream commit SHA/date in the table above.
4. Update the `@frontend-design-expert` agent
   (`.github/agents/frontend-design-expert.agent.md`) and `AGENT.md` if the
   set of available skills or their guidance changed materially.
5. Run through `README.md`'s "Frontend Design Guidelines" section and update
   it if the list of ported skills changed.

## Why "adapted" instead of a verbatim copy

The individual skill repos linked from the toolkit are published under a
mix of licenses (some unspecified, some restrictive commercial terms). To
stay safe from a licensing standpoint while still being transparent about
where the ideas came from, each skill here is a rewritten port that credits
its source rather than a byte-for-byte copy of upstream files.
