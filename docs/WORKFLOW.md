# Personal workflow — notebook + roll codes

This app saves **chart lookup time** and **tank volume math**. Narrative notes, inversion preferences, and density judgments stay in your **physical notebook** (or at the scanner).

## Before you develop

1. **Search** — film, developer, format, ISO.
2. **Session card** — chart time, working time, dilution volumes, stop bath, agitation.
3. **Copy roll code** — e.g. `250619-K400-RODI`. Write it in your Midori and on the tank bag if helpful.
4. **Print card** (optional) — slip at the sink; volumes only, not a full journal.

## At the sink

Use the session card numbers. Log shooting context and observations in your notebook — not in the app.

## After you develop

1. On the session card, set **Developed on** if needed.
2. Optional **Notebook ref** — e.g. `Midori p. 42` (one line linking paper to digital).
3. **Log roll** — adds a row to **Library → Developed rolls** and increments the combo roll counter.

## When you scan

Name exports with the roll code:

```text
250619-K400-RODI_001.tif
250619-K400-RODI_002.tif
```

Inversion density and scanner settings belong in your notebook at the inversion step.

## What lives where

| Item | Where |
|------|--------|
| Chart times, volumes | This app (session card) |
| Roll code registry | Library → Developed rolls |
| Recipe markdown | Library → Saved recipes (optional) |
| Combo tweaks (working time, presoak) | Workbook on session card |
| Shooting notes, outcomes, scan prefs | **Physical notebook** |
| Negative archive | Your files / sleeves |

## Backup

Export library JSON from **Preferences** (v4 includes developed rolls). Re-import on another browser on the same machine or after a Pi deploy (browser storage is per device until shared DB in a future release).

## Raspberry Pi (LAN)

Production-style UI on your home network:

```bash
docker compose --profile prod up --build api web-prod
```

Open `http://<pi-ip>:8080` from phones or laptops on the same Wi‑Fi. Set `CORS_ORIGINS` in `.env` to include your Pi URL. Personal library remains in each browser until v0.3.1 shared storage.

See [QUICKSTART.md](QUICKSTART.md) for full setup.
