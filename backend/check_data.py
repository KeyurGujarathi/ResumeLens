from database import SessionLocal
import models

db = SessionLocal()

total_postings = db.query(models.JobPosting).count()
print(f"Total postings: {total_postings}")

sample = db.query(models.JobPosting).filter(
    models.JobPosting.company.has(name="Stripe")
).first()

print(f"\nSample: {sample.title}")
print(f"Skills detected: {sorted(s.skill.name for s in sample.skills)}")

db.close()