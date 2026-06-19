---
name: pull-lexicons
description:
  Use when asked to pull, sync, update, or refresh the latest AT Protocol lexicons for the
  definitions packages — runs pull + generate, classifies each package's diff, and commits per
  package.
---

# Pulling Lexicons

Refreshes the generated lexicon definitions from upstream services and commits the result, one
commit per package. Invoking this skill authorizes those commits for this run.

## Workflow

Run from the repo root:

```
pnpm run -r pull
pnpm run -r generate
```

`-r` fans out across the workspace; only the `packages/definitions/*` packages define these scripts,
so those are the only ones that change.

Then `git status` and handle **each changed definitions package independently** — classify its diff,
then act:

1. README only — only the `lexicons/README.md` regenerated → discard it (`git restore`). The README
   regenerates on every pull; its churn alone carries no real change.
2. Docs only — lexicon sources (the JSON under `lexicons/`) changed, generated code under `lib/` did
   not → commit, no changeset. Nothing in the published API surface moved, so there's no version to
   bump.
3. Docs and code — both the lexicon sources and the generated code under `lib/` changed → add a
   changeset, then commit.

Each package gets its own commit. The regenerated `lexicons/README.md` rides along in cases 2 and 3
(only case 1 discards it).

## Commit

Message — short package name in the scope, service name capitalized (proper noun):

```
chore(<pkg>): pull latest <Service> lexicons
```

e.g. `chore(frontpage): pull latest Frontpage lexicons`. Use `chore`: these pulls are upstream
refreshes, not new API surface, so never `feat`.

## Changeset (case 3 only)

Write `.changeset/<pkg>-pull-lexicons.md`, using the package's full `@atcute/<pkg>` name:

```markdown
---
'@atcute/<pkg>': patch
---

pull latest <Service> lexicons
```

Always `patch`. Lexicon refreshes don't follow semver here — even an upstream breaking change is a
patch bump (see [[definitions_versioning]]).

## Stop for highly-breaking changes

One exception forces a stop: a **highly-breaking** change needs a major bump and is yours to call.
The signature case is a service relocating to a new NSID namespace, which changes _how the package's
types are exported_ — e.g. Frontpage moving to `fyi.frontpage.*` (frontpage `2.0.0`). A field tweak
or added definition is not this.

When you spot one, **stop and defer to the user** rather than committing — surface the change and
ask how to version it.
