# CareerTwin AI - Machine Learning & NLP Methodology

## 1. Skill Extraction & Alias Normalization

Skill extraction uses a multi-tier pipeline:
1. **Canonical Taxonomy**: Standardized against ESCO (European Skills, Competences, Qualifications and Occupations) and O*NET software skills.
2. **Alias Normalization**: Maps informal variants, acronyms, and aliases to canonical entities:
   - `JS` -> `JavaScript`
   - `React.js` -> `React`
   - `Postgres` -> `PostgreSQL`
   - `ML` -> `Machine Learning`
   - `NLP` -> `Natural Language Processing`
   - `K8s` -> `Kubernetes`
3. **Word Boundary Assertion**: Prevents substring false positives using negative lookaheads `(?<![a-zA-Z0-9#+.])pattern(?![a-zA-Z0-9#+.])`.
4. **Demonstrated Evidence Heuristic**: Distinguishes mere skill list mentions from active application in projects or work history by scanning proximity to strong action verbs (`architected`, `engineered`, `developed`, `optimized`, `deployed`).

## 2. Semantic Similarity & Embeddings

- **Primary Model**: Pre-trained SentenceTransformer `sentence-transformers/all-MiniLM-L6-v2` generating 384-dimensional dense semantic vectors.
- **Cosine Metric**:
  $$\text{Cosine Similarity} = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|_2 \|\mathbf{v}\|_2}$$
- **Embedding Cache**: Caches encoded representations in-memory to prevent repeated inference on identical texts.
- **TF-IDF Fallback**: If the embedding model cannot load or runs in an offline environment without model weights, the system automatically falls back to Scikit-Learn `TfidfVectorizer(stop_words='english')` and computes cosine similarity on the sparse TF-IDF term matrix.

## 3. Explainable Compatibility Scoring Formula

Compatibility is calculated as a transparent weighted combination:

$$\text{Score} = w_{\text{req}} \cdot S_{\text{req}} + w_{\text{pref}} \cdot S_{\text{pref}} + w_{\text{exp}} \cdot S_{\text{exp}} + w_{\text{role}} \cdot S_{\text{role}}$$

Where:
- $w_{\text{req}} = 0.65$ (Required Skills Coverage)
- $w_{\text{pref}} = 0.15$ (Preferred Skills Coverage)
- $w_{\text{exp}} = 0.15$ (Project & Experience Relevance)
- $w_{\text{role}} = 0.05$ (Target Role Title Semantic Alignment)

**Match Multipliers**:
- Strong Match: $1.0$
- Partial Match (related technology or semantic similarity $\ge 0.80$): $0.5$
- Missing Skill: $0.0$

**Dynamic Renormalization**: If a job posting specifies no preferred skills, $w_{\text{pref}}$ is set to $0$ and remaining weights are renormalized:
$$w_i' = \frac{w_i}{\sum_{j \in \text{active}} w_j}$$

## 4. Evaluation Benchmark Results

The pipeline was validated against a human-labelled ground-truth benchmark of technical resumes (`backend/app/ml/benchmark.py`):
- **Total Ground Truth Skills**: 33
- **Total Extracted Skills**: 33
- **Precision**: 0.9697 (97.0%)
- **Recall**: 0.9697 (97.0%)
- **F1-Score**: 0.9697 (97.0%)

