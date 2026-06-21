from dataclasses import asdict, dataclass
from typing import Any

from film_core.normalize import normalize_value, sanitize_notes
from film_core.query.gold_store import GoldStore


@dataclass(frozen=True)
class DevelopingTimeMatch:
    film: str
    developer: str
    format: str
    iso: str
    dilution: str | None
    dev_time: str
    temp: str | None
    notes: str | None
    film_id: int | None
    developer_id: int | None
    format_id: int | None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def lookup_developing_times(
    store: GoldStore,
    *,
    film: str,
    developer: str,
    format: str,
    iso: str,
    dilution: str | None = None,
) -> list[DevelopingTimeMatch]:
    film_key = normalize_value(film)
    developer_key = normalize_value(developer)
    format_key = normalize_value(format)
    iso_key = normalize_value(iso)
    dilution_key = normalize_value(dilution) if dilution else None

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
          AND developer = ?
          AND format = ?
          AND iso = ?
    """
    params: list[str] = [film_key, developer_key, format_key, iso_key]

    if dilution_key:
        sql += " AND dilution = ?"
        params.append(dilution_key)

    sql += " ORDER BY dilution NULLS LAST, dev_time"

    rows = store.connection.execute(sql, params).fetchall()
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
