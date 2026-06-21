# Legal & Open Source Considerations

> **Disclaimer:** This is practical guidance for an open-source software project, not legal advice. Consult a lawyer before a commercial release or if DigitalTruth contacts you.

---

## Summary

| What | Recommendation |
|------|----------------|
| **Open-source the code** | Yes — ETL tooling, API, CLI, React UI |
| **Redistribute scraped data** | Avoid — do not ship full DigitalTruth datasets in the repo or releases |
| **Let users scrape themselves** | Yes — document `film-agent scrape` as the intended data path |
| **Use data in LLM recipes** | Lookup + prompt context is the product; do not train models on their data |
| **Attribute DigitalTruth** | Always — in README, API responses, and recipe metadata |
| **Contact DigitalTruth** | Optional but recommended before a high-visibility public launch |

---

## Who Owns the Data?

DigitalTruth operates the [Massive Dev Chart](https://www.digitaltruth.com/devchart.php). The site footer states:

> Copyright © Digitaltruth Photo Ltd. All rights reserved.

The development chart is a **compiled database** of film/developer/time combinations. Even when individual times are factual, the **collection and presentation** may be protected as a database right (especially in the EU) or under copyright as a creative compilation.

Your project does not own this data. It is a **tool that reads publicly displayed pages** and transforms them for personal/educational use.

---

## robots.txt (checked 2025)

DigitalTruth publishes a [robots.txt](https://www.digitaltruth.com/robots.txt) with Cloudflare-managed **Content-Signals**:

```
User-agent: *
Content-Signal: search=yes,ai-train=no
Allow: /
```

Interpretation for this project:

| Signal | Meaning for Film Developer Agent |
|--------|----------------------------------|
| `search=yes` | Building a searchable index from public pages is explicitly signaled as permitted |
| `ai-train=no` | Do **not** use their content to train or fine-tune AI models |
| `ai-input` | Not specified — site neither grants nor restricts via Content-Signal |
| `Allow: /` | No path-level blocks for general crawlers |

Specific AI crawlers (GPTBot, ClaudeBot, etc.) are **disallowed**, but your scraper uses a standard browser User-Agent, not those bots.

**Project rules derived from this:**

1. ✅ Scrape politely for personal/on-demand ETL (manual trigger)
2. ✅ Use scraped times as **lookup values** in recipe generation (RAG-style context)
3. ❌ Do not fine-tune or train models on DigitalTruth exports
4. ❌ Do not republish their full chart as a competing downloadable database

---

## Open Source Release Strategy

### Ship in the repository

- Python source (scraper, processor, normalizer, API, CLI)
- React frontend
- **Minimal test fixtures** (5–10 rows, synthetic or hand-copied for tests only)
- Documentation and `LICENSE` file (MIT or Apache-2.0 are common choices)
- `NOTICE` file attributing DigitalTruth as the data source

### Do not ship (or gitignore)

- Full `digitaltruth_film_data.json` (~15k rows)
- Full processed/normalized parquet derived from live scrapes
- Any bulk export presented as "the DigitalTruth database"

### README language (suggested)

```text
This tool fetches publicly available development data from DigitalTruth.
It is not affiliated with or endorsed by Digitaltruth Photo Ltd.
Users are responsible for complying with DigitalTruth's terms and robots.txt.
Run the scraper yourself; this repository does not redistribute their data.
```

### Current repo note

Pipeline output under `data/` is gitignored. The format dimension lives in `catalogs/film_formats.json` (small, curated). Users run the scraper to populate `data/raw/` locally.

---

## LLM Recipe Generation

Your product uses an LLM to **format** a recipe around **lookup data** (film, developer, time, dilution, temperature). This is different from:

| Activity | Risk level |
|----------|------------|
| Lookup time from gold parquet → inject into prompt | Lower — factual reference + templated instructions |
| LLM writes agitation/wash/fix steps (generic darkroom knowledge) | Lower — general process knowledge |
| LLM invents a developing time not in the data | **Must prevent** — already in roadmap |
| Fine-tuning on DigitalTruth exports | **Prohibited** by their `ai-train=no` signal |

Always return metadata with recipes:

```json
{
  "source": "DigitalTruth Massive Dev Chart",
  "source_url": "https://www.digitaltruth.com/devchart.php",
  "scrape_date": "2025-08-13",
  "disclaimer": "Verify all times independently. Not affiliated with DigitalTruth."
}
```

---

## Scraping Etiquette (already in code)

- Manual/on-demand only (no scheduled hammering of their server)
- Rate limits (`SCRAPE_DELAY_*`, `MAX_WORKERS`)
- Valid User-Agent strings
- Retry with backoff on failures

If DigitalTruth asks you to stop, **stop** and pivot to user-supplied data files or an official partnership.

---

## Alternatives If Risk Is Too High

| Approach | Trade-off |
|----------|-----------|
| **User brings data** | CLI accepts uploaded CSV/JSON; no scraper in default path |
| **Link out** | App opens DigitalTruth for lookup; LLM only formats user-entered times |
| **Official permission** | Email [contact on privacy page](https://www.digitaltruth.com/privacy.php) — best for commercial hosting |
| **Other sources** | ILFORD datasheets, manufacturer PDFs (each with own terms) |

---

## License Recommendation for the Code

| License | Fit |
|---------|-----|
| **MIT** | Simple, permissive, common for tools |
| **Apache-2.0** | Similar + explicit patent grant |

Add a `NOTICE` file:

```text
Film Developer Agent
Copyright (c) 2025 Marcos Franco

This product uses data from DigitalTruth (digitaltruth.com).
DigitalTruth and Massive Dev Chart are trademarks of Digitaltruth Photo Ltd.
This project is not affiliated with Digitaltruth Photo Ltd.
```

---

## Checklist Before Public Launch

- [x] Choose OSS license (MIT / Apache-2.0)
- [x] Add `LICENSE`, `NOTICE`, and attribution in README
- [x] Remove bulk scraped data from git (`data/` gitignored)
- [x] Keep curated format catalog in `catalogs/`
- [x] Document "run scraper yourself" in README and CLI help
- [x] Recipe API returns source attribution + disclaimer
- [x] Confirm `ai-train=no` policy in contributor guidelines (see [CONTRIBUTING.md](../CONTRIBUTING.md))
- [ ] (Optional) Email DigitalTruth for goodwill / permission
- [ ] (Optional) Lawyer review if you monetize hosting or sell a SaaS

---

## FAQ

**Can I open-source this project?**  
Yes, the **software** is a strong OSS candidate. Be careful about **redistributing their dataset**.

**Can I host a public API that serves scraped times?**  
Higher risk than local-only tooling. You would be republishing their compilation. Prefer self-hosted / bring-your-own-data model for OSS.

**Is scraping illegal?**  
Depends on jurisdiction, scale, ToS, and whether you bypass protections. Public, polite, manual scraping for personal use is a common pattern but not risk-free. EU database rights may apply to the chart as a collection.

**Does `search=yes` mean we're fine?**  
It is a positive signal for index-building, but it is not a full legal release. It supports your architecture (local index in parquet) but does not replace attribution and non-redistribution practices.

**What about their mobile app?**  
DigitalTruth sells the Massive Dev Chart Timer app. An OSS *recipe assistant* that credits them and does not replace their app is a different product — but still use respectful scraping and no data resale.
