import math
import re

import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

nlp_model = spacy.load("en_core_web_sm")
analyzer = SentimentIntensityAnalyzer()

# Noisy tokens to filter out
STOPWORDS_EXTRA = {
    "said", "also", "would", "could", "one", "two", "new", "like",
    "just", "get", "got", "make", "year", "years", "time", "way",
    "say", "says", "people", "first", "last", "know", "think",
    "going", "really", "even", "much", "many", "well", "back",
    "still", "want", "need", "see", "use", "used", "using",
    "image source", "getty images", "read more", "subscribe",
    "advertisement", "copyright", "rights reserved", "click",
    "share", "comment", "follow", "newsletter", "sign",
    "photo", "video", "related", "story", "article",
}


def _strip_markdown(text: str) -> str:
    """Remove markdown syntax and URLs from text."""
    # Remove images: ![alt](url)
    text = re.sub(r"!\[.*?\]\(.*?\)", "", text)
    # Remove links: [text](url) -> text
    text = re.sub(r"\[([^\]]*?)\]\(.*?\)", r"\1", text)
    # Remove remaining URLs
    text = re.sub(r"https?://\S+", "", text)
    # Remove markdown headings markers
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
    # Remove bold/italic markers
    text = re.sub(r"\*{1,3}(.*?)\*{1,3}", r"\1", text)
    text = re.sub(r"_{1,3}(.*?)_{1,3}", r"\1", text)
    # Remove markdown horizontal rules
    text = re.sub(r"^[-*_]{3,}$", "", text, flags=re.MULTILINE)
    # Remove remaining brackets
    text = re.sub(r"[\[\]()]", " ", text)
    # Remove HTML tags if any remain
    text = re.sub(r"<[^>]+>", "", text)
    # Collapse whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _is_noisy(word: str) -> bool:
    """Check if a token is noisy or not meaningful."""
    w = word.lower().strip()
    if w in STOPWORDS_EXTRA:
        return True
    if len(w) < 2:
        return True
    # Pure numbers
    if re.match(r"^\d+$", w):
        return True
    # No letters at all
    if not re.search(r"[a-zA-Z]", w):
        return True
    # URL fragments that survived
    if any(x in w for x in ["http", "www.", ".com", ".org", ".edu", ".net", "wp-content"]):
        return True
    # Markdown leftovers
    if any(x in w for x in ["](", "[+", "![", "**"]):
        return True
    return False


def _dedupe_ngrams(scored: list[tuple[str, float]]) -> list[tuple[str, float]]:
    """Remove near-duplicate n-grams (e.g., keep 'climate change' over 'climate')."""
    result: list[tuple[str, float]] = []
    seen_words: set[str] = set()

    for word, score in scored:
        parts = set(word.lower().split())

        # Skip if ALL parts of this term are already covered by higher-scored terms
        if parts and parts.issubset(seen_words):
            continue

        result.append((word, score))
        seen_words.update(parts)

    return result


def extract_keywords(text: str, top_n: int = 45) -> list[dict]:
    """Extract weighted keywords using TF-IDF, spaCy NER, and VADER sentiment."""

    # Step 1: Clean markdown artifacts BEFORE any NLP
    clean_text = _strip_markdown(text)

    # Step 2: Split into sentences/paragraphs for multi-document TF-IDF
    # This gives better weight variance than single-document TF-IDF
    paragraphs = [p.strip() for p in clean_text.split("\n") if len(p.strip()) > 30]
    if len(paragraphs) < 3:
        # Fall back to sentence splitting
        paragraphs = [s.strip() for s in re.split(r"[.!?]+", clean_text) if len(s.strip()) > 20]

    if not paragraphs:
        paragraphs = [clean_text]

    # Step 3: TF-IDF across paragraphs for real weight variance
    vectorizer = TfidfVectorizer(
        max_features=top_n * 3,
        ngram_range=(1, 2),
        stop_words="english",
        min_df=1,
        max_df=0.85,  # Ignore terms in >85% of paragraphs (too common)
        token_pattern=r"(?u)\b[a-zA-Z][a-zA-Z]{1,}\b",
    )

    try:
        tfidf_matrix = vectorizer.fit_transform(paragraphs)
    except ValueError:
        return []

    feature_names = vectorizer.get_feature_names_out()

    # Aggregate scores across all paragraphs: use max score per term
    # (max captures peak relevance better than mean for keyword extraction)
    dense = tfidf_matrix.toarray()
    scores: dict[str, float] = {}
    for i, name in enumerate(feature_names):
        col = dense[:, i]
        max_val = float(col.max())
        freq = int((col > 0).sum())
        # Boost terms that appear in multiple paragraphs but not all
        freq_boost = 1 + 0.2 * min(freq, 5)
        scores[name] = max_val * freq_boost

    # Step 4: Filter noisy tokens
    scores = {w: s for w, s in scores.items() if not _is_noisy(w)}

    # Step 5: spaCy NER on clean text — boost named entities
    doc = nlp_model(clean_text[:100000])
    entities: set[str] = set()
    for ent in doc.ents:
        if ent.label_ in ["PERSON", "ORG", "GPE", "EVENT", "PRODUCT", "NORP", "FAC"]:
            name = ent.text.strip()
            if len(name) > 1 and not _is_noisy(name):
                entities.add(name.lower())

    for entity in entities:
        if entity in scores:
            scores[entity] *= 1.5
        elif len(entity) > 2:
            scores[entity] = 0.25

    if not scores:
        return []

    # Step 6: Normalize weights to [0, 1] with spread
    max_score = max(scores.values())
    min_score = min(scores.values())
    score_range = max_score - min_score if max_score != min_score else 1.0

    # Sort by score desc, then prefer bigrams over unigrams (richer terms first)
    sorted_words = sorted(scores.items(), key=lambda x: (-x[1], -len(x[0].split())))

    # Deduplicate overlapping n-grams
    deduped = _dedupe_ngrams(sorted_words)[:top_n]

    # Step 7: Build results with normalized weights that actually spread 0-1
    results = []
    for word, score in deduped:
        # Normalize to [0, 1] using min-max scaling
        normalized = (score - min_score) / score_range
        # Apply sqrt to spread out the middle range (prevents clustering at top)
        weight = round(math.sqrt(normalized), 4)

        sentiment = analyzer.polarity_scores(word)["compound"]
        results.append({
            "word": word,
            "weight": weight,
            "sentiment": round(sentiment, 4),
        })

    return results
