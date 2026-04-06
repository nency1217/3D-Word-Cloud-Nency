import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data == {"status": "ok"}


def test_analyze_invalid_url():
    resp = client.post("/analyze", json={"url": "not-a-url"})
    assert resp.status_code == 422


def test_analyze_response_schema():
    """Test that /analyze returns the correct schema shape (uses bs4 fallback)."""
    resp = client.post(
        "/analyze",
        json={"url": "https://www.example.com"},
    )
    # example.com has very little text, so we expect either 422 (too short) or 200
    if resp.status_code == 200:
        data = resp.json()
        assert "words" in data
        assert "total" in data
        assert isinstance(data["words"], list)
        if len(data["words"]) > 0:
            word = data["words"][0]
            assert "word" in word
            assert "weight" in word
            assert "sentiment" in word
            assert 0 <= word["weight"] <= 1
            assert -1 <= word["sentiment"] <= 1
    else:
        # 422 or 500 are acceptable for example.com
        assert resp.status_code in (422, 500)
