import logging
from typing import List, Union, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    _instance = None
    _model = None
    _cache = {}
    _failed_to_load = False

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = EmbeddingService()
        return cls._instance

    def __init__(self):
        self._load_model()

    def _load_model(self):
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading SentenceTransformer: {settings.EMBEDDING_MODEL_NAME}")
            try:
                # Try loading from local HuggingFace cache first without network call
                self._model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME, local_files_only=True)
            except Exception:
                self._model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
            logger.info("SentenceTransformer loaded successfully.")
        except Exception as e:
            logger.warning(f"Failed to load SentenceTransformer ({e}). Falling back to TF-IDF.")
            self._failed_to_load = True
            self._model = None

    def encode(self, texts: Union[str, List[str]]) -> Optional[np.ndarray]:
        is_single = isinstance(texts, str)
        text_list = [texts] if is_single else texts
        
        # Check cache for single text
        if is_single and texts in self._cache:
            return self._cache[texts]

        if self._model is not None:
            try:
                embeddings = self._model.encode(text_list, convert_to_numpy=True, show_progress_bar=False)
                if is_single:
                    self._cache[texts] = embeddings[0]
                    return embeddings[0]
                return embeddings
            except Exception as e:
                logger.error(f"Error computing sentence embeddings: {e}")

        return None

    def compute_similarity(self, text1: str, text2: str) -> float:
        """
        Calculates cosine similarity between two texts.
        Uses SentenceTransformer embeddings if available; otherwise falls back to TF-IDF.
        """
        if not text1.strip() or not text2.strip():
            return 0.0

        if self._model is not None:
            emb1 = self.encode(text1)
            emb2 = self.encode(text2)
            if emb1 is not None and emb2 is not None:
                sim = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2) + 1e-9)
                return float(max(0.0, min(1.0, sim)))

        # Fallback to TF-IDF Cosine Similarity
        return self.compute_tfidf_similarity(text1, text2)

    def compute_tfidf_similarity(self, text1: str, text2: str) -> float:
        try:
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform([text1, text2])
            sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(max(0.0, min(1.0, sim)))
        except Exception as e:
            logger.warning(f"TF-IDF similarity failed ({e}); fallback simple word overlap.")
            words1 = set(text1.lower().split())
            words2 = set(text2.lower().split())
            if not words1 or not words2:
                return 0.0
            return len(words1.intersection(words2)) / max(len(words1), len(words2))

embedding_service = EmbeddingService.get_instance()
