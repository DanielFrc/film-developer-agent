# Phase 5 — Screen Map & Implementation Plan

Based on [`.interfacerules`](.interfacerules), reconciled with the existing REST API and [PHASE5_INTERFACE.md](PHASE5_INTERFACE.md).

---

## Screen evaluation

| # | Screen (interfacerules) | Route | Status | API today | Notes |
|---|-------------------------|-------|--------|-----------|-------|
| 1 | **Home / Dashboard** | `/` | **Iteration 1** | `GET /stats`, `GET /health` | Last queries via `localStorage` |
| 2 | **Search / Lookup** | `/search` | **Iteration 2** ✅ | `/films`, `/developers`, `/formats`, `/developing-times` | Extended UI fields mapped below |
| 3 | **Search Results** | `/search` (panel) | **Iteration 2** ✅ | `/developing-times` | *Added* — not explicit in interfacerules but required by flow |
| 4 | **Development Recipe Detail** | `/recipe` | Iteration 3 | `POST /recipes` | Markdown + metadata + copy |
| 5 | **Generate Recipe** | `/generate` → merged into `/search` | Iteration 3 | `POST /recipes` | Same flow; extra_context + loading state |
| 6 | **Data Explorer** | `/explorer` | Iteration 4 | `GET /explorer/*` | Layer tabs, filters, schema, CSV export |
| — | **Not Found** | `*` | Iteration 1 | — | 404 route |

### Field mapping (Search screen)

| UI field (interfacerules) | API / storage | Phase |
|---------------------------|---------------|-------|
| Film stock | `film` (canonical `SearchResultItem.name`) | 2 |
| ISO exposed | `iso` | 2 |
| ISO nominal | UI-only label; optional note in `extra_context` | 2 |
| Developer | `developer` | 2 |
| Dilution | `dilution` | 2 |
| Format | `format` (`35mm` \| `120` \| `sheet`) | 2 |
| Temperature °C / °F | Display from lookup `temp`; °F conversion client-side | 2 |
| Agitation method | `extra_context` | 2 |
| Recommended time | `dev_time` from lookup | 2 |
| Source | `DigitalTruth` constant + link | 2 |
| Notes | `notes` from lookup | 2 |
| Confidence | Derived from fuzzy `score` or `100` on exact match | 2 |
| Warnings | Derived: ambiguous dilution, missing notes, disclaimer | 2 |

### Missing API (future iterations)

| Need | Proposed endpoint | Screen |
|------|-------------------|--------|
| Dashboard stats | `GET /stats` ✅ added | Dashboard |
| Data explorer rows | `GET /explorer/{layer}?page=&film=&...` | Explorer |
| Pipeline status | `GET /pipeline/status` (optional) | Dashboard |

---

## Folder structure (`apps/web/src/`)

```
src/
├── api/
│   ├── client.ts          # filmApi HTTP client
│   └── types.ts           # API + UI types
├── components/
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   └── RecentQueries.tsx
│   ├── explorer/
│   │   └── ExplorerPlaceholder.tsx
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── NavBar.tsx
│   │   └── PageHeader.tsx
│   ├── recipe/
│   │   ├── RecipeDetail.tsx      # iteration 3
│   │   ├── RecipeMetadata.tsx
│   │   └── SourcePanel.tsx
│   ├── search/
│   │   ├── SearchForm.tsx        # iteration 2
│   │   ├── LookupResults.tsx
│   │   ├── FilmAutocomplete.tsx
│   │   └── DeveloperAutocomplete.tsx
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── EmptyState.tsx
│       ├── ErrorBanner.tsx
│       └── LoadingSpinner.tsx
├── hooks/
│   ├── useAsync.ts
│   ├── useDebounce.ts
│   └── useRecentQueries.ts
├── lib/
│   ├── constants.ts
│   ├── format.ts
│   └── storage.ts
├── pages/
│   ├── DashboardPage.tsx         # ✅ iteration 1
│   ├── SearchPage.tsx            # iteration 2
│   ├── RecipePage.tsx            # iteration 3
│   ├── ExplorerPage.tsx          # iteration 4
│   └── NotFoundPage.tsx
├── routes/
│   └── router.tsx
├── styles/
│   └── index.css                 # Tailwind + autumn theme
├── App.tsx
└── main.tsx
```

---

## Main components

| Component | Responsibility |
|-----------|----------------|
| `AppShell` | Layout, nav, API health indicator |
| `NavBar` | Links: Dashboard, Search, Explorer |
| `StatCard` | Dashboard metric card |
| `RecentQueries` | Last N lookups from `localStorage` |
| `SearchForm` | Full lookup form with autocomplete |
| `LookupResults` | Time, source, notes, confidence, warnings |
| `RecipeDetail` | Rendered recipe + actions |
| `SourcePanel` | DigitalTruth attribution, `source_hash` |
| `ExplorerPlaceholder` | *(removed)* — replaced by `DataExplorer` |
| `DataExplorer` | Layer selector, filters, paginated table, schema, CSV export |
| `ErrorBanner` / `EmptyState` / `LoadingSpinner` | Shared states |

---

## TypeScript types (summary)

See `apps/web/src/api/types.ts`:

- **API:** `DatasetStatsResponse`, `SearchResultItem`, `DevelopingTimeItem`, `RecipeRequest`, `RecipeResponse`
- **UI:** `SearchFormValues`, `LookupResultView`, `RecentQuery`, `ConfidenceLevel`, `ExplorerLayer`
- **State:** `AsyncState<T>`, `RoutePath`

---

## Implementation iterations

| Iteration | Screens | Deliverables |
|-----------|---------|--------------|
| **1** ✅ | Dashboard, NotFound, routing, Tailwind | Stats cards, recent queries, New query CTA |
| **2** ✅ | Search + Results | Form, autocomplete, lookup panel, dilution picker |
| **3** ✅ | Recipe Detail + Generate | Markdown, cached badge, regenerate, copy, print |
| **4** ✅ | Data Explorer | Backend explorer API + table + export |

---

## Phase 5 exit checklist

- [x] CORS + OpenAPI + web scaffold
- [x] Screen map from `.interfacerules`
- [x] Folder structure + Tailwind theme
- [x] Routing + shared layout
- [x] **Iteration 1: Dashboard**
- [x] Iteration 2: Search / Lookup + results
- [x] Iteration 3: Recipe detail + generate flow
- [x] Iteration 4: Data Explorer (API + UI)
- [x] Error states 404 / 409 / 502 / 503
- [x] `docker compose` api + web verified

---

## Design tokens (autumn / darkroom)

- Surface: warm cream `#f6f1e8`
- Ink: `#2c2419`
- Accent: amber `#b45309`
- Success: olive `#3f6f4b`
- Warning: rust `#9a3412`

Defined in `apps/web/src/styles/index.css` via Tailwind `@theme`.
