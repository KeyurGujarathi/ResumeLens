from taxonomy import extract_skills

sample = (
    "We need a backend engineer with Python, FastAPI and PostgreSQL experience. "
    "Knowledge of Docker, AWS and CI/CD pipelines is a plus. "
    "Familiarity with JavaScript and C++ is nice."
)

print(sorted(extract_skills(sample)))