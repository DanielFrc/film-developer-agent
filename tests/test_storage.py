import json

from film_core.manifest import PipelineManifest
from film_core.storage.local import LocalStorage


def test_local_storage_read_write_json(tmp_path):
    storage = LocalStorage(tmp_path)
    storage.write_json("raw/sample.json", {"hello": "world"})
    assert storage.read_json("raw/sample.json") == {"hello": "world"}
    assert storage.exists("raw/sample.json")


def test_local_storage_ensure_dir_for_file(tmp_path):
    storage = LocalStorage(tmp_path)
    path = storage.ensure_dir("processed/out.parquet")
    assert path.parent == tmp_path / "processed"


def test_pipeline_manifest_to_dict():
    manifest = PipelineManifest.start(run_id="test_run")
    manifest.begin_stage("transform")
    manifest.finish_stage("transform", status="success", outputs={"rows": 3})
    manifest.finish("success")

    payload = manifest.to_dict()
    assert payload["run_id"] == "test_run"
    assert payload["status"] == "success"
    assert payload["stages"]["transform"]["status"] == "success"
    assert payload["stages"]["transform"]["outputs"]["rows"] == 3


def test_pipeline_manifest_save(tmp_path, monkeypatch):
    storage = LocalStorage(tmp_path)
    import film_core.manifest as manifest_module

    monkeypatch.setattr(manifest_module, "get_storage", lambda: storage)

    manifest = PipelineManifest.start(run_id="test_run")
    manifest.finish("success")
    saved = manifest.save()

    assert saved.exists()
    payload = json.loads(saved.read_text())
    assert payload["run_id"] == "test_run"
