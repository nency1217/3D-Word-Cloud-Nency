import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

nlp_model = spacy.load("en_core_web_sm")
analyzer = SentimentIntensityAnalyzer()


def extract_keywords(text: str, top_n: int = 45) -> list[dict]:
    """Extract weighted keywords using TF-IDF, spaCy NER, and VADER sentiment."""

    # TF-IDF for keyword weight scores
    vectorizer = TfidfVectorizer(
        max_features=top_n * 2,
        ngram_range=(1, 2),
        stop_words="english",
        min_df=1,
    )
    tfidf = vectorizer.fit_transform([text])
    scores = dict(zip(
        vectorizer.get_feature_names_out(),
        tfidf.toarray()[0],
    ))

    # spaCy NER — boost named entities
    doc = nlp_model(text[:100000])
    entities = {
        ent.text.lower()
        for ent in doc.ents
        if ent.label_ in ["PERSON", "ORG", "GPE", "EVENT", "PRODUCT"]
    }

    for word in list(scores.keys()):
        if word in entities:
            scores[word] *= 1.3

    # Normalize weights to [0, 1]
    max_score = max(scores.values()) if scores else 1
    top_words = sorted(scores.items(), key=lambda x: -x[1])[:top_n]

    # VADER sentiment per keyword
    results = []
    for word, score in top_words:
        sentiment = analyzer.polarity_scores(word)["compound"]
        results.append({
            "word": word,
            "weight": round(score / max_score, 4),
            "sentiment": round(sentiment, 4),
        })
    return results
