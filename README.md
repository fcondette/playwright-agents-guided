# Playwright agents — guided run

The Playwright agent pipeline (planner → generator → healer) run against
`shop.missionplaywright.fr` with a `CLAUDE.md` encoding conventions drawn from a
hand-written suite for the same site.

Result: five page objects, one login fixture, six cart tests in a single spec
file, and no failures across two consecutive `--repeat-each=3` runs.

**[COMPARISON.md](COMPARISON.md)** sets out this run against the unguided
baseline — what each agent got right and wrong, and the caveats that stop it
being a controlled experiment.

The unguided baseline is at
[playwright-agents-unguided](https://github.com/fcondette/playwright-agents-unguided).

---

## Structure

| Path                 | Contents                                                             |
| -------------------- | -------------------------------------------------------------------- |
| `CLAUDE.md`          | the conventions given to the agents                                  |
| `pages/`             | page objects produced by the run                                     |
| `fixtures/`          | the login fixture                                                    |
| `tests/seed.spec.ts` | the seed the planner runs to reach a logged-in cart before exploring |
| `tests/cart.spec.ts` | six cart scenarios                                                   |
| `specs/cart.plan.md` | the plan the generator worked from                                   |

## Running the tests

```bash
npm install
npx playwright install
npx playwright test
```

Tests run against the live demo site. `npx playwright test` runs the seed
alongside the six cart tests.
