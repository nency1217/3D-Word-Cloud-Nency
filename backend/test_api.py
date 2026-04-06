from unittest.mock import patch, AsyncMock

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_analyze_invalid_url():
    resp = client.post("/analyze", json={"url": "not-a-url"})
    assert resp.status_code == 422


def test_analyze_missing_url():
    resp = client.post("/analyze", json={})
    assert resp.status_code == 422


@patch("main.fetch_article", new_callable=AsyncMock)
def test_analyze_response_schema(mock_fetch):
    """Test /analyze returns correct schema using mocked article text."""
    mock_fetch.return_value = (
        "Climate change is accelerating. The United Nations held a major summit "
        "in New York to discuss carbon emissions and renewable energy policy. "
        "Scientists warn that global temperatures could rise significantly. "
        "Joe Biden and other world leaders committed to reducing greenhouse gases. "
        "The Paris Agreement goals remain critical for environmental protection. "
        "Activists demand stronger action from governments worldwide. "
        "Energy companies are investing heavily in solar and wind technology. "
        "The European Union announced new regulations on industrial pollution. "
        "Developing nations seek financial support for green transitions. "
        "Ocean acidification threatens marine ecosystems across the globe."
    )

    resp = client.post(
        "/analyze",
        json={"url": "https://www.example.com/article"},
    )
    assert resp.status_code == 200

    data = resp.json()
    assert "words" in data
    assert "total" in data
    assert isinstance(data["words"], list)
    assert data["total"] > 0

    word = data["words"][0]
    assert "word" in word
    assert "weight" in word
    assert "sentiment" in word
    assert 0 <= word["weight"] <= 1
    assert -1 <= word["sentiment"] <= 1


@patch("main.fetch_article", new_callable=AsyncMock)
def test_analyze_short_text_rejected(mock_fetch):
    """Test that articles with too little text are rejected."""
    mock_fetch.return_value = "Too short."

    resp = client.post(
        "/analyze",
        json={"url": "https://www.example.com/short"},
    )
    assert resp.status_code == 422
