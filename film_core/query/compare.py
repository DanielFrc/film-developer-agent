from film_core.normalize import normalize_value, sanitize_notes
from film_core.query.gold_store import GoldStore
from film_core.query.lookup import DevelopingTimeMatch


def compare_developers(
    store: GoldStore,
    *,
    film: str,
    format: str,
    iso: str,
) -> list[DevelopingTimeMatch]:
    """Return all active developing times for a film/format/ISO across developers."""
    film_key = normalize_value(film)
    format_key = normalize_value(format)
    iso_key = normalize_value(iso)

    sql = """
        SELECT
            film,
            developer,
            format,
            iso,
            dilution,
            dev_time,
            temp,
            notes,
            film_id,
            developer_id,
            format_id
        FROM developing_times
        WHERE active = true
          AND film = ?
          AND format = ?
          AND iso = ?
        ORDER BY developer, dilution NULLS LAST, dev_time
    """
    rows = store.connection.execute(sql, [film_key, format_key, iso_key]).fetchall()
    return [
        DevelopingTimeMatch(
            film=row[0],
            developer=row[1],
            format=row[2],
            iso=row[3],
            dilution=row[4],
            dev_time=str(row[5]),
            temp=row[6],
            notes=sanitize_notes(row[7]),
            film_id=row[8],
            developer_id=row[9],
            format_id=row[10],
        )
        for row in rows
    ]
