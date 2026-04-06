import os

import httpx
from dotenv import load_dotenv

load_dotenv()

FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY", "")
FIRECRAWL_URL = os.getenv("FIRECRAWL_URL", "https://api.firecrawl.dev/v1/scrape")


async def fetch_article(url: str) -> str:
    """Fetch and extract clean article text using Firecrawl API."""
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
