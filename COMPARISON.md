# Guided vs. unguided AI test generation

Two runs of the Playwright agent pipeline (planner → generator → healer) against
the same application, `shop.missionplaywright.fr`. The first was given no
guidance beyond a seed test. The second was given a `CLAUDE.md` encoding
conventions drawn from a hand-written suite built for the same site.

The question was whether written architectural rules change what the agents
produce, or whether the limitation is inherent.

---

## Summary

| | Unguided | Guided |
|---|---|---|
| Page objects | 0 | 5 |
| Fixtures | 0 | 1 |
| Spec files | 24 | 1 |
| Login blocks duplicated | 24 | 0 |
| Credentials declared | 24× | once |
| Failures on first run | 6 / 24 | 0 / 6 |
| `--repeat-each=3` | 10–12 failures / 72 | 0 failures / 42 |

The unguided suite was reviewed and repaired by hand, then had readiness
assertions applied across ten files by the healer agent. The flakiness figures
above are from *after* that work.

---

## Unguided run

**Scope:** authenticated checkout flow. 24 scenarios planned, 24 spec files
generated.

### What worked

The planner did not hallucinate. Asked for a guest checkout plan, it explored
the site, found that checkout requires authentication, and said so rather than
inventing a plan for a flow that does not exist.

It also surfaced two genuine application defects, both since reproduced
manually:

- Cart state is client-side only. A reload or direct URL navigation empties it.
- The checkout wizard has no route from the payment step back to the shipping
  form. A user who spots an error in their address cannot return to correct it.

The generator was a faithful executor. Every one of the 24 planned files was
produced, none invented, none skipped — confirmed by diffing the plan's declared
filenames against the directory.

### What did not

**No architecture at all.** No page objects, no fixtures, no shared setup. The
same twelve-line login block appears in all 24 files, and the credential
constants are redeclared in each.

**Inconsistent within a single run.** Some files wrapped setup in
`test.step()`, others used bare statements. Most navigated with
`getByRole("link", …)`; one used a raw CSS locator. There is no convention to
learn, so every file has to be read in full.

**A framework-level misunderstanding.** Five tests contained no setup
whatsoever — they opened by clicking a navigation link, having apparently
treated the plan's `Seed:` field as meaning the seed test would run
automatically beforehand. It does not; each `test()` receives a fresh browser
context. Those five failed immediately on a blank page.

**Locator collisions.** `getByLabel("Nom")` matched both the first-name and
last-name inputs, because "Nom" is a substring of "Prénom" — a strict mode
violation. Separately, asserting on `[data-sonner-toast]` after adding a second
product matched two toasts at once.

**No readiness assertions anywhere.** This is the significant one. Tests
navigated and then acted immediately, with nothing asserting the destination had
rendered. Eleven files submitted a form on a page that may not have finished
loading. Two failed on the first run; the other nine passed by luck.

### Flakiness

After the six failures were fixed by hand and the healer had added readiness
assertions across ten files, the suite was run with `--repeat-each=3`:

| Run | Failed | Passed |
|---|---|---|
| 1 | 10 | 62 |
| 2 | 12 | 60 |

Nine distinct tests were affected — roughly a third of the suite — at a 14–17%
failure rate. Individual runs frequently came back green, which is what makes
this class of defect expensive: every spot check says the suite is fine.

### Agent behaviour worth noting

The **healer** showed real judgement. Instructed to add readiness assertions
before every form submission, it read the surrounding code first and flagged one
case where the test deliberately empties a required field to verify validation —
adding the assertion there would have contradicted the test's purpose. It asked
rather than applying the instruction blindly. It also reported the redundant
assertions it had created by following "change nothing else" literally.

It did not, however, run a single test after making 27 edits across 10 files.
Its report described the changes as "syntactically valid" on the basis of
confidence rather than verification.

---

## Guided run

**Scope:** six cart scenarios, chosen because equivalents exist in the
hand-written suite.

`CLAUDE.md` specified: page objects in `pages/`, no direct locator calls in
specs, no assertions inside page objects, login in a fixture, grouping with
`test.describe()`, readiness assertions before acting, `await expect(locator)`
never `expect(await …)`, no `waitForTimeout()`, `{ exact: true }` on text
locators with the product-card-link exception, and the client-side cart
constraint.

### Result

Five page objects, one fixture, one spec file, six tests. Verified by
inspection:

- `grep -n "expect" pages/*.ts` — no output. No assertions in page objects.
- No `page.getByTestId()` in the spec.
- Setup state asserted before every absence assertion.
- `not.toBeAttached()` used for elements removed from the DOM, which is more
  precise than `not.toBeVisible()` and matches what the application actually
  does.

Two consecutive `--repeat-each=3` runs: 21 passed, 21 passed. No failures across
42 executions.

### The intervention that mattered

The generator agent could not create `pages/` or `fixtures/` itself — its write
tool is sandboxed to the configured `testDir`. It wrote the page object classes
and the fixture into the spec file instead, with a comment at the top explaining
that it knew this violated `CLAUDE.md` and could not do otherwise, and that the
pieces should be extracted.

Claude Code then performed that extraction.

This distinction matters. The generator understood the convention and produced
the right abstractions. It could not place them. The architecture in the final
result is the agent's design, moved by a wrapper.

### A bug caught mid-run

`CartPage.lineTotal()` was initially written to match by amount text across the
whole page. That works with two items in the cart and breaks the moment a
single-item cart makes the line total, subtotal and total all display the same
figure — a strict mode violation. It surfaced at the second scenario and was
rewritten to scope by item id.

The same collision is documented in the hand-written suite's findings, where it
required an `xpath=..` traversal to resolve.

### What guidance did not fix

Every test opens with the same five lines instantiating page objects:

```typescript
const page = authenticatedPage;
const header = new HeaderPage(page);
const productsPage = new ProductsPage(page);
const productPage = new ProductPage(page);
const cartPage = new CartPage(page);
```

Six near-identical blocks. The login duplication was eliminated; this smaller
version of the same problem was not, because `CLAUDE.md` said page objects must
live in `pages/` but not that they should be *provided as fixtures*. A rule that
specific was not written, so it was not followed.

Step names are also the plan's prose copied verbatim — full sentences where a
short label belongs — and each is duplicated in a comment directly above it.

---

## Caveats

This is a comparison, not a controlled experiment. Both runs used Sonnet 5 with
high effort in Claude Code, but several other variables moved at once:


- **Different scope.** 24 checkout scenarios versus 6 cart scenarios.
- **Different flows.** Checkout involves an asynchronously prefilled form; the
  cart does not. Some of the unguided flakiness may be specific to that form.
- **Different generation strategy.** The unguided run generated all 24 scenarios
  in bulk. The guided run generated one scenario at a time, running each before
  proceeding. This alone would be expected to improve results, and it was not a
  variable I set deliberately — Claude Code chose it.
- **Prior knowledge fed in.** `CLAUDE.md` included the product-card-link
  `exact: true` exception and a rule against the unreliable quick add-to-cart
  button, both learned from earlier work. A team starting fresh would not have
  these.

The direction of the result is clear. The magnitude is not attributable to
`CLAUDE.md` alone.

---

## Conclusions

**Written conventions are followed when they are specific.** "Use page objects"
produced page objects. The absence of a rule about fixture-provided page objects
produced instantiation boilerplate. The agents did what they were told, at the
granularity they were told it.

**The agents cannot detect timing defects, because their own exploration is too
slow to trigger them.** The generator verifies each step interactively, pausing
between tool calls. Under those conditions pages always finish rendering and
toasts always dismiss before the next action. Run the same sequence at full
speed and both assumptions fail. This is a structural blind spot, not
carelessness — and it is precisely what a tester's habit of asserting readiness
rather than assuming it exists to prevent.

**Review cost is the binding constraint, not generation cost.** Generating 24
files took two sessions. Reviewing them took an afternoon and was more tiring
than writing them would have been — because with no shared conventions, no
abstraction can be trusted to apply anywhere else, so every file must be read in
full.

**Scoped generation beats bulk generation.** Six scenarios generated and
verified one at a time produced no failures. Twenty-four generated in bulk
produced six failures and nine flaky tests. Errors compound: the missing-setup
problem was one wrong assumption applied 24 times, and it would have been caught
after the first scenario.

**The judgement stays with the tester.** The healer correctly identified an
intentionally-empty field that should not receive a readiness assertion — but it
also made 27 edits without running anything. The planner found two real
application defects — but it also proposed tests asserting the absence of
features nobody had specified. Both agents are useful. Neither is a substitute
for deciding whether a failing test means the test is wrong or the application
is.
