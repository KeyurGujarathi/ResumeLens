import re
import html
import httpx
from datetime import datetime, timezone

from database import SessionLocal
import models
from taxonomy import extract_skills


def strip_html(raw):
    text = re.sub(r"<[^>]+>", " ", raw or "")
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def fetch_company_jobs(board_token):
    url = f"https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs"
    response = httpx.get(url, params={"content": "true"}, timeout=60)
    response.raise_for_status()
    return response.json().get("jobs", [])


def run():
    db = SessionLocal()
    skill_lookup = {s.name: s for s in db.query(models.Skill).all()}

    try:
        companies = db.query(models.Company).all()

        for company in companies:
            print(f"Fetching {company.name} ({company.board_token})...")

            try:
                jobs = fetch_company_jobs(company.board_token)
            except httpx.HTTPError as error:
                print(f"  Skipped {company.name}: {error}")
                continue

            new_count = 0
            updated_count = 0

            for job in jobs:
                external_id = str(job["id"])
                description = strip_html(job.get("content", ""))

                published_at = (
                    datetime.fromisoformat(job["first_published"])
                    if job.get("first_published")
                    else None
                )

                posting = (
                    db.query(models.JobPosting)
                    .filter_by(external_id=external_id)
                    .first()
                )

                if posting is None:
                    posting = models.JobPosting(
                        company_id=company.id,
                        external_id=external_id,
                        title=job.get("title", ""),
                        url=job.get("absolute_url", ""),
                        description=description,
                        first_published_at=published_at,
                    )
                    db.add(posting)
                    db.flush()
                    new_count += 1
                else:
                    posting.last_seen_at = datetime.now(timezone.utc)
                    posting.title = job.get("title", posting.title)
                    posting.description = description
                    posting.first_published_at = published_at
                    updated_count += 1
                    posting.skills.clear()

                found_skill_names = extract_skills(
                    description + " " + job.get("title", "")
                )

                for skill_name in found_skill_names:
                    skill = skill_lookup.get(skill_name)

                    if skill is None:
                        continue

                    posting.skills.append(
                        models.JobPostingSkill(skill_id=skill.id)
                    )

            db.commit()

            print(
                f"  {new_count} new, "
                f"{updated_count} updated, "
                f"{len(jobs)} total on board"
            )

    finally:
        db.close()


if __name__ == "__main__":
    run()