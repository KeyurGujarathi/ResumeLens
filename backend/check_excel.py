import re
from database import SessionLocal
import models
from taxonomy import _COMPILED

db = SessionLocal()

postings = (
    db.query(models.JobPosting)
    .join(models.JobPostingSkill)
    .join(models.Skill)
    .filter(models.Skill.name == "Excel")
    .limit(5)
    .all()
)

patterns = _COMPILED["Excel"]

for p in postings:
    print(f"\n--- {p.title} ---")
    for pattern in patterns:
        match = pattern.search(p.description)
        if match:
            start, end = match.span()
            print(p.description[max(0, start - 40): end + 40])
            break

db.close()