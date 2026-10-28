# Rule: the glossary is the map of the domain

`docs/glossary/` is the normative dictionary of the project's ubiquitous language, grouped by bounded context (`docs/glossary/README.md`). Every term names one concept, and its *Code:* part names the one type, enum, module or function that owns that concept. This rule applies to every agent and human working in the repository, in every artifact: code, tests, specs, proposals, designs, docs, translations, commit messages and PR descriptions.

The glossary exists to stop two failures:

- **Duplicated logic:** a second function that computes what an owner already computes (another offset formatter, another "is this the device zone" check, another day-boundary calculation).
- **Smeared logic:** one concept spread over several layers or modules, so that no single place owns it (a day period decided partly in the presenter, partly in a view).

## Before writing code: look the concept up

1. Name the concept the task is about in domain words ("UTC offset of a location", "reference day", "Here mark").
2. Find it in `docs/glossary/`. Start from the README's context table, then search the files (`grep -rni "<word>" docs/glossary`).
3. If the term exists, open its *Code:* owner and **reuse or extend it**. Do not write a new function, type or constant for the same concept anywhere else, and in no other layer.
4. If the owner does not fit the need, change the owner and its tests, so the concept keeps one home. Do not fork it into a near-copy.
5. Only when no term matches is the concept new. Then follow "Adding or changing a term" below before you name anything.

The *Code:* part is a pointer, not a promise. If it names something that no longer exists, find the current owner, fix the entry in the same change, and say so in the PR.

## Naming

- Domain types, enums, functions, fields, constants, files, i18n keys, Gherkin steps and spec text use the glossary term (`naming.md` still applies to form: verbs, booleans, plurals).
- A name that carries a glossary concept under a different word is a bug, even if the code works. Renaming the concept means renaming the code, specs and translations in the same change.
- Words listed under *Never:* must not appear for that concept in code, comments, specs, docs, translations or discussions. Quoting an external source verbatim is the one exception.
- Russian interface text uses the *RU:* name. A translation that renames a concept in Russian is the same bug as a renamed type (`i18n.md`).
- A *(planned)* term is already binding: future code for it uses that name.

## Where a concept lives

The glossary context of a term tells you its layer and module. Keep it there (`architecture.md`):

- Time math, day periods, the reference day and every rule of the model → `src/model/`, owned once, pure.
- Formatting and localized text of a concept → `src/presenter/`, one `present*` / `format*` owner per concept.
- Side effects around a concept (ticks, writes, sync, update checks) → one hook in `src/controller/`.
- A UI block every view needs → one component in `views/shared/` (see "Shared block").

If a task seems to need the same concept in a second layer, the second layer calls the owner; it does not recompute.

## Adding or changing a term

- A change that introduces a new domain concept adds its glossary entry **in the same change**, before or together with the code that names it. Use the entry format of `docs/glossary/README.md` and choose the context file it belongs to.
- A change that shifts a term's meaning, owner or Russian name updates the entry in the same change.
- For an OpenSpec change, list new or changed terms in `proposal.md` ("What Changes"), add a task for the glossary entries in `tasks.md`, and use only glossary terms in specs and Gherkin.
- A term used inside one document only may be defined there instead. Promote it to the glossary once a second artifact needs it.
- Keep each context file under 200 lines. When one grows past that, split the context, not the entries.

## Review checklist

Before finishing a task, check:

1. Every new type, function, constant and i18n key names a glossary concept, or the change adds that concept's entry.
2. No new code computes something that a *Code:* owner already computes. Search for the owner's name and for the concept's words.
3. No *Never:* word was introduced (`grep -rniE "<never words>" packages/client/src docs openspec/specs`).
4. Each entry whose owner or meaning the change touched is updated.
