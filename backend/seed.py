from database import SessionLocal, engine, Base
import models
from taxonomy import SKILLS

# (display name, Greenhouse board token)
COMPANIES = [
    ("Stripe", "stripe"),
    ("Airbnb", "airbnb"),
    ("Cloudflare", "cloudflare"),
    ("Databricks", "databricks"),
    ("Figma", "figma"),
    ("Coinbase", "coinbase"),
    ("Datadog", "datadog"),
    ("Twilio", "twilio"),
    ("GitLab", "gitlab"),
    ("Reddit", "reddit"),
    ("Pinterest", "pinterest"),
    ("Robinhood", "robinhood"),
    ("MongoDB", "mongodb"),
    ("Elastic", "elastic"),
    ("Okta", "okta"),
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing_skills = {s.name for s in db.query(models.Skill).all()}
        new_skills = 0
        for name, info in SKILLS.items():
            if name not in existing_skills:
                db.add(models.Skill(name=name, category=info["category"]))
                new_skills += 1

        existing_companies = {c.name for c in db.query(models.Company).all()}
        new_companies = 0
        for name, token in COMPANIES:
            if name not in existing_companies:
                db.add(models.Company(name=name, board_token=token))
                new_companies += 1

        db.commit()

        print(f"Added {new_skills} skills and {new_companies} companies.")
        print(f"Totals: {db.query(models.Skill).count()} skills, "
              f"{db.query(models.Company).count()} companies.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()