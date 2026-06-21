from film_core.normalize import sanitize_notes


def test_sanitize_notes_drops_footnote_reference_codes():
    assert sanitize_notes("[hcB][a09]") is None
    assert sanitize_notes("[a26]") is None
    assert sanitize_notes("[80]") is None


def test_sanitize_notes_keeps_human_readable_text():
    assert sanitize_notes("Agfa Datasheet 2014") == "Agfa Datasheet 2014"
    assert sanitize_notes("Test note") == "Test note"


def test_sanitize_notes_handles_empty_values():
    assert sanitize_notes(None) is None
    assert sanitize_notes("") is None
    assert sanitize_notes("   ") is None
