# Phase 5.2 — Personal workflow iteration

**Status:** Complete

Locked decisions from planning:

| Decision | Choice |
|----------|--------|
| Default recipe key | `(film, developer, format)` |
| Saved recipe payload | Full markdown only (+ display metadata client-side) |
| Explorer drill-down | Catalog views for films/developers; gold facts for combinations |
| Preferences | Global profile + per-film overrides (client-side) |
| LLM settings UI | **Not in scope** (server `.env` only) |

## Iteration breakdown

### 5.2a — Backend + Explorer catalogs ✅
- `GET /explorer/catalog?catalog=films|developers`
- Dashboard stat cards link to `/explorer?catalog=films|developers` and gold facts

### 5.2b — Local library (`localStorage`) ✅
- Saved combinations
- Saved recipes (markdown)
- Default recipes per `(film, developer, format)`
- Favorite films / developers (manual + auto from lookup frequency)

### 5.2c — Dashboard + Search + Recipe UX ✅
- Dashboard sections: saved recipes, saved combinations, favorites
- Search: save combination, push/pull hint when box speed ≠ EI
- Recipe: save markdown, set as default, use default before LLM

### 5.2d — Preferences ✅
- `/preferences` — global agitation, camera, style notes → merged into `extra_context`

### 5.2e — Per-film preference overrides ✅
- `film-agent:film-preferences` localStorage map keyed by canonical film name
- Blank override fields inherit global values; `getEffectivePreferences(film)` used at recipe time
- Preferences page editor + deep link from Search (`/preferences?film=…`)

## Out of scope
- Recipe chat / interactive editing
- LLM keys in browser
- ETL box speed / push-pull time calculation
- User accounts / cloud sync

## Storage keys (browser)

| Key | Content |
|-----|---------|
| `film-agent:saved-combinations` | Pinned lookup combos |
| `film-agent:saved-recipes` | Markdown snapshots |
| `film-agent:default-recipes` | Map by `film\|developer\|format` |
| `film-agent:favorite-films` | Starred + lookup counts |
| `film-agent:favorite-developers` | Starred + lookup counts |
| `film-agent:user-preferences` | Global profile |
| `film-agent:film-preferences` | Per-film override map |
