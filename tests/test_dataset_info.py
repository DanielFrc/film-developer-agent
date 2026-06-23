import json

from film_core.contract import GOLD_SCHEMA_VERSION
from film_core.dataset_info import get_dataset_metadata, load_latest_manifest
from film_core.manifest import PipelineManifest


def test_pipeline_manifest_includes_schema_version():
    manifest = PipelineManifest.start(run_id="contract_test")
    assert manifest.schema_version == GOLD_SCHEMA_VERSION
    payload = manifest.to_dict()
    assert payload["schema_version"] == "1"


def test_load_latest_manifest_picks_most_recent(tmp_path, monkeypatch):
    import film_core.dataset_info as dataset_info_module

    manifests = tmp_path / "manifests"
    manifests.mkdir()
    (manifests / "older.json").write_text(
        json.dumps(
            {
                "run_id": "older",
                "started_at": "2026-01-01T00:00:00+00:00",
                "finished_at": "2026-01-01T00:05:00+00:00",
                "status": "success",
                "schema_version": "1",
            }
        ),
        encoding="utf-8",
    )
    (manifests / "newer.json").write_text(
        json.dumps(
            {
                "run_id": "newer",
                "started_at": "2026-06-01T00:00:00+00:00",
                "finished_at": "2026-06-01T00:10:00+00:00",
                "status": "success",
                "schema_version": "1",
            }
        ),
        encoding="utf-8",
    )

    manifest_dir = manifests

    class Paths:
        manifests = manifest_dir

    monkeypatch.setattr(dataset_info_module, "get_data_paths", lambda: Paths())

    latest = load_latest_manifest(successful_only=True)
    assert latest is not None
    assert latest["run_id"] == "newer"


def test_get_dataset_metadata_from_manifest(gold_dataset, tmp_path, monkeypatch):
    import config

    manifest = PipelineManifest.start(run_id="stats_meta_test")
    manifest.finish("success")
    manifest.save()

    config.refresh_from_env()
    meta = get_dataset_metadata()

    assert meta.schema_version == GOLD_SCHEMA_VERSION
    assert meta.pipeline_run_id == "stats_meta_test"
    assert meta.pipeline_status == "success"
    assert meta.source_hash
    assert meta.source_hash != "no-gold-data"
