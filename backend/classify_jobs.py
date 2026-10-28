import re

from sqlalchemy.orm import Session, selectinload

from database import SessionLocal
from models import (
    CareerDomain,
    JobPosting,
    JobPostingCareerDomain,
    JobPostingSkill,
)
from career_domains import get_career_domains


def normalize_text(value):
    """
    Normalize text so keyword comparisons are more reliable.
    """
    if not value:
        return ""

    value = value.lower()
    value = re.sub(r"[^a-z0-9+#./&-]+", " ", value)
    value = re.sub(r"\s+", " ", value)

    return value.strip()


def contains_phrase(text, phrase):
    """
    Check whether a complete normalized phrase exists in text.
    """
    normalized_text = normalize_text(text)
    normalized_phrase = normalize_text(phrase)

    if not normalized_phrase:
        return False

    pattern = rf"(?<!\w){re.escape(normalized_phrase)}(?!\w)"

    return re.search(
        pattern,
        normalized_text,
        flags=re.IGNORECASE,
    ) is not None


def classify_posting(posting, domain_definitions):
    """
    Return the career domains that best match one job posting.

    Title matches are stronger than skill matches.
    """

    title = posting.title or ""

    posting_skill_names = {
        normalize_text(link.skill.name)
        for link in posting.skills
        if link.skill and link.skill.name
    }

    matched_domains = []

    for domain_name, domain in domain_definitions.items():
        title_matches = []

        for keyword in domain["job_title_keywords"]:
            if contains_phrase(title, keyword):
                title_matches.append(keyword)

        domain_skill_names = {
            normalize_text(skill)
            for skill in domain["skills"]
        }

        skill_matches = posting_skill_names.intersection(
            domain_skill_names
        )

        title_score = len(title_matches) * 5
        skill_score = len(skill_matches) * 2

        total_score = title_score + skill_score

        # Strong title match.
        if title_score >= 5:
            matched_domains.append(
                (
                    domain_name,
                    total_score,
                    title_matches,
                    skill_matches,
                )
            )
            continue

        # At least two relevant skills provide enough evidence.
        if len(skill_matches) >= 2:
            matched_domains.append(
                (
                    domain_name,
                    total_score,
                    title_matches,
                    skill_matches,
                )
            )

    # Strongest matches first.
    matched_domains.sort(
        key=lambda item: item[1],
        reverse=True,
    )

    selected = []

    for item in matched_domains:
        domain_name, score, title_matches, skill_matches = item

        if not selected:
            selected.append(item)
            continue

        # Additional domains need meaningful evidence.
        if title_matches or len(skill_matches) >= 2:
            selected.append(item)

    return selected


def get_or_create_domains(
    db: Session,
    domain_definitions,
):
    """
    Ensure every taxonomy domain exists in the database.
    """

    domain_objects = {}

    for domain_name, definition in domain_definitions.items():
        domain = (
            db.query(CareerDomain)
            .filter(
                CareerDomain.name == domain_name
            )
            .first()
        )

        if domain is None:
            domain = CareerDomain(
                name=domain_name,
                description=definition["description"],
            )

            db.add(domain)
            db.flush()

        else:
            domain.description = definition["description"]

        domain_objects[domain_name] = domain

    return domain_objects


def classify_all_jobs():
    """
    Classify every existing JobPosting in the database.

    Existing career-domain mappings are cleared first so the
    script can safely be run again after taxonomy changes.
    """

    db = SessionLocal()

    try:
        domain_definitions = get_career_domains()

        print("Loading career domains...")

        domain_objects = get_or_create_domains(
            db,
            domain_definitions,
        )

        print(
            f"Career domains available: "
            f"{len(domain_objects)}"
        )

        print(
            "Removing previous career-domain mappings..."
        )

        db.query(
            JobPostingCareerDomain
        ).delete()

        db.commit()

        print("Loading job postings...")

        postings = (
            db.query(JobPosting)
            .options(
                selectinload(
                    JobPosting.skills
                ).selectinload(
                    JobPostingSkill.skill
                )
            )
            .all()
        )

        print(
            f"Job postings loaded: "
            f"{len(postings)}"
        )

        domain_counts = {
            domain_name: 0
            for domain_name in domain_definitions
        }

        unclassified = 0
        total_links = 0

        print("Classifying job postings...")

        for index, posting in enumerate(
            postings,
            start=1,
        ):
            matches = classify_posting(
                posting,
                domain_definitions,
            )

            if not matches:
                unclassified += 1

            else:
                for match in matches:
                    (
                        domain_name,
                        score,
                        title_matches,
                        skill_matches,
                    ) = match

                    domain = domain_objects[
                        domain_name
                    ]

                    mapping = JobPostingCareerDomain(
                        posting=posting,
                        domain=domain,
                    )

                    db.add(mapping)

                    domain_counts[
                        domain_name
                    ] += 1

                    total_links += 1

            if index % 500 == 0:
                print(
                    f"Processed {index} / "
                    f"{len(postings)} postings..."
                )

        db.commit()

        print()
        print(
            "Career-domain classification completed."
        )
        print()

        print("Domain counts:")

        for domain_name, count in domain_counts.items():
            print(
                f"  {domain_name}: {count}"
            )

        print()
        print(
            f"Total career-domain links: "
            f"{total_links}"
        )

        print(
            f"Unclassified postings: "
            f"{unclassified}"
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    classify_all_jobs()