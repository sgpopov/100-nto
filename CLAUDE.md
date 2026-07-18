# 100 НТО

## Code comments

Default to no comment. The code should speak for itself: reach for a clearer
name, a smaller function, or an extracted constant before reaching for a
comment.

Write one only when it carries something the code cannot:

- **Why, not what** — a constraint, a trade-off, a rejected alternative, or a
  bug it works around.
- **Non-local facts** — why a test picks a specific fixture (why `Видин` and
  not another city), why an order matters, an external quirk the reader would
  otherwise have to discover.
- **Absences** — something deliberately *not* done, since nothing in the code
  marks it.

Do not write restatements of the line below, docblocks that only re-list the
name and params, section banners, or narration of the edit being made.

## Domain language

The app tracks two collectibles per site. Use the Bulgarian terms in prose and
the English ones in code:

- **печат** / `stamp` — universal, every site has one. `false` means not yet
  collected.
- **марка** / `sticker` — three-state: `true` collected, `false` not collected,
  `null` не се предлага at this site.

All reasoning about these lives in `src/lib/collectionStatus.ts` — a pure,
framework-free module. Consumers ask it rather than testing the fields
themselves, so the rules cannot drift between the list, the map, the filters and
the progress line.

## Testing

- `npm test` — vitest, unit and component.
- `npm run test:e2e` — playwright.

End-to-end assertions target stable test attributes (`data-testid`,
`data-pin-status`), never colours or class names, which are expected to change.
