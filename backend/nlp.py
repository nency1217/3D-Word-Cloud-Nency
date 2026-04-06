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
    "advertisement", "copyright", "rights reserved",
}


def _lemmatize_text(text: str) -> str:
    """Lemmatize text using spaCy for better keyword grouping."""
    doc = nlp_model(text[:100000])
    return " ".join(
        token.lemma_.lower()
        for token in doc
        if not token.is_stop and not token.is_punct and len(token.text) > 1
    )


def _is_noisy(word: str) -> bool:
    """Check if a token is noisy or not meaningful."""
    if word.lower() in STOPWORDS_EXTRA:
        return True
    if len(word) < 2:
        return True
    if re.match(r"^\d+$", word):
        return True
    if re.match(r"^[^a-zA-Z]+$", word):
        return True
    return False


def _dedupe_ngrams(scored: list[tuple[str, float]]) -> list[tuple[str, float]]:
    """Remove near-duplicate n-grams (e.g., keep 'climate change' over 'climate')."""
    result: list[tuple[str, float]] = []
    seen_parts: set[str] = set()

    # Sort by score descending — higher-scored terms get priority
    for word, score in scored:
        parts = set(word.lower().split())

        # Skip if this is a single word that's part of a higher-scored bigram
        if len(parts) == 1 and word.lower() in seen_parts:
            continue

        result.append((word, score))
        seen_parts.update(parts)

    return result


def extract_keywords(text: str, top_n: int = 45) -> list[dict]:
    """Extract weighted keywords using TF-IDF, spaCy NER, and VADER sentiment."""

    # Lemmatize for better grouping
    lemmatized = _lemmatize_text(text)

    # TF-IDF for keyword weight scores
    vectorizer = TfidfVectorizer(
        max_features=top_n * 3,
        ngram_range=(1, 2),
        stop_words="english",
        min_df=1,
        token_pattern=r"(?u)\b[a-zA-Z][a-zA-Z+]{1,}\b",
    )
    tfidf = vectorizer.fit_transform([lemmatized])
    scores = dict(zip(
        vectorizer.get_feature_names_out(),
        tfidf.toarray()[0],
    ))

    # Filter noisy tokens
    scores = {w: s for w, s in scores.items() if not _is_noisy(w)}

    # spaCy NER on original text — boost named entities
    doc = nlp_model(text[:100000])
    entities = {
        ent.text.lower()
        for ent in doc.ents
        if ent.label_ in ["PERSON", "ORG", "GPE", "EVENT", "PRODUCT"]
        and len(ent.text) > 1
    }

    # Add entities not captured by TF-IDF, boost existing ones
    for entity in entities:
        if entity in scores:
            scores[entity] *= 1.3
        elif len(entity) > 2:
            scores[entity] = 0.3  # Add with moderate score

    # Normalize weights to [0, 1]
    max_score = max(scores.values()) if scores else 1
    sorted_words = sorted(scores.items(), key=lambda x: -x[1])

    # Deduplicate n-grams
    deduped = _dedupe_ngrams(sorted_words)[:top_n]

    # VADER sentiment per keyword
    results = []
    for word, score in deduped:
        sentiment = analyzer.polarity_scores(word)["compound"]
        results.append({
            "word": word,
            "weight": round(score / max_score, 4),
            "sentiment": round(sentiment, 4),
        })
    return results
