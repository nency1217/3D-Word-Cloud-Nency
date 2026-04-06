import logging
import os
import re

import httpx
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY", "")
FIRECRAWL_URL = os.getenv("FIRECRAWL_URL", "https://api.firecrawl.dev/v1/scrape")


async def _firecrawl_fetch(url: str) -> str:
    """Fetch article via Firecrawl API (primary)."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            FIRECRAWL_URL,
            headers={"Authorization": f"Bearer {FIRECRAWL_API_KEY}"},
            json={
                "url": url,
                "formats": ["markdown"],
                "onlyMainContent": True,
                "excludeTags": ["nav", "footer", "header", "aside", "script"],
            },
        )
        resp.raise_for_status()
        data = resp.json()

        if not data.get("success"):
            raise ValueError(f"Firecrawl failed: {data.get('error', 'Unknown error')}")

        markdown = data.get("data", {}).get("markdown", "")
        if not markdown:
            raise ValueError("No content extracted from the article")

        return markdown


async def _bs4_fallback(url: str) -> str:
    """Fallback: fetch article via direct HTTP + BeautifulSoup."""
    from bs4 import BeautifulSoup

    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
        resp = await client.get(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
        )
        resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    # Remove non-content elements
    for tag in soup.find_all(["nav", "footer", "header", "aside", "script", "style", "iframe", "noscript"]):
        tag.decompose()

    # Try <article> first, fall back to <main>, then <body>
    content = soup.find("article") or soup.find("main") or soup.find("body")
    if not content:
        raise ValueError("Could not find article content in HTML")

    # Extract paragraphs for cleaner text
    paragraphs = content.find_all("p")
    if paragraphs:
        text = "\n\n".join(p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 20)
    else:
        text = content.get_text(separator="\n", strip=True)

    # Basic cleanup
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)

    if not text.strip():
        raise ValueError("No text content extracted from the page")

    return text


async def fetch_article(url: str) -> str:
    """Fetch article: try Firecrawl first, fall back to BeautifulSoup."""
    if FIRECRAWL_API_KEY:
        try:
            return await _firecrawl_fetch(url)
        except Exception as e:
            logger.warning("Firecrawl failed for %s: %s — falling back to bs4", url, e)

    return await _bs4_fallback(url)
