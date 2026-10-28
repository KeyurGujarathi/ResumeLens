
import re


def calculate_resume_score(text: str, detected_skills: list[str]):
    """
    Calculate a simple explainable resume score.

    The score is intentionally rule-based so that every
    part of the score can be explained to the user.
    """

    text_lower = text.lower()

    # -----------------------------------------
    # 1. Skills
    # -----------------------------------------

    skill_count = len(detected_skills)

    if skill_count >= 15:
        skills_score = 100
    elif skill_count >= 12:
        skills_score = 90
    elif skill_count >= 9:
        skills_score = 80
    elif skill_count >= 6:
        skills_score = 65
    elif skill_count >= 3:
        skills_score = 50
    else:
        skills_score = 30

    # -----------------------------------------
    # 2. Projects
    # -----------------------------------------

    project_keywords = [
        "project",
        "projects",
        "developed",
        "built",
        "implemented",
        "designed",
    ]

    project_matches = sum(
        1
        for keyword in project_keywords
        if keyword in text_lower
    )

    if project_matches >= 4:
        projects_score = 100
    elif project_matches >= 3:
        projects_score = 90
    elif project_matches >= 2:
        projects_score = 75
    elif project_matches >= 1:
        projects_score = 60
    else:
        projects_score = 30

    # -----------------------------------------
    # 3. Education
    # -----------------------------------------

    education_keywords = [
        "education",
        "university",
        "college",
        "bachelor",
        "degree",
        "engineering",
        "b.tech",
        "btech",
        "cgpa",
        "gpa",
    ]

    education_matches = sum(
        1
        for keyword in education_keywords
        if keyword in text_lower
    )

    if education_matches >= 4:
        education_score = 100
    elif education_matches >= 3:
        education_score = 90
    elif education_matches >= 2:
        education_score = 80
    elif education_matches >= 1:
        education_score = 65
    else:
        education_score = 30

    # -----------------------------------------
    # 4. Certifications
    # -----------------------------------------

    certification_keywords = [
        "certification",
        "certifications",
        "certificate",
        "certified",
        "nptel",
        "course",
        "courses",
        "workshop",
    ]

    certification_matches = sum(
        1
        for keyword in certification_keywords
        if keyword in text_lower
    )

    if certification_matches >= 4:
        certification_score = 100
    elif certification_matches >= 3:
        certification_score = 90
    elif certification_matches >= 2:
        certification_score = 80
    elif certification_matches >= 1:
        certification_score = 65
    else:
        certification_score = 30

    # -----------------------------------------
    # 5. Experience
    # -----------------------------------------

    experience_keywords = [
        "experience",
        "internship",
        "intern",
        "work experience",
        "employment",
        "worked",
        "developer",
        "engineer",
    ]

    experience_matches = sum(
        1
        for keyword in experience_keywords
        if keyword in text_lower
    )

    if experience_matches >= 4:
        experience_score = 100
    elif experience_matches >= 3:
        experience_score = 85
    elif experience_matches >= 2:
        experience_score = 70
    elif experience_matches >= 1:
        experience_score = 55
    else:
        experience_score = 35

    # -----------------------------------------
    # 6. Contact / basic resume structure
    # -----------------------------------------

    contact_checks = 0

    if re.search(r"\b[\w\.-]+@[\w\.-]+\.\w+\b", text):
        contact_checks += 1

    if re.search(r"(linkedin\.com|github\.com)", text_lower):
        contact_checks += 1

    if re.search(r"\b\d{10}\b", text):
        contact_checks += 1

    if contact_checks == 3:
        formatting_score = 100
    elif contact_checks == 2:
        formatting_score = 85
    elif contact_checks == 1:
        formatting_score = 65
    else:
        formatting_score = 40

    # -----------------------------------------
    # Overall score
    # -----------------------------------------

    overall_score = round(
        (
            skills_score * 0.25
            + projects_score * 0.20
            + education_score * 0.15
            + certification_score * 0.10
            + experience_score * 0.20
            + formatting_score * 0.10
        )
    )

    # -----------------------------------------
    # Strengths
    # -----------------------------------------

    strengths = []

    if skills_score >= 80:
        strengths.append(
            "Good technical skill coverage"
        )

    if projects_score >= 80:
        strengths.append(
            "Strong project section"
        )

    if education_score >= 80:
        strengths.append(
            "Education information is clearly represented"
        )

    if certification_score >= 80:
        strengths.append(
            "Good certification and learning activity"
        )

    if experience_score >= 80:
        strengths.append(
            "Good evidence of practical experience"
        )

    if formatting_score >= 80:
        strengths.append(
            "Good basic contact information"
        )

    # -----------------------------------------
    # Improvements
    # -----------------------------------------

    improvements = []

    if skills_score < 80:
        improvements.append(
            "Add more relevant technical skills"
        )

    if projects_score < 80:
        improvements.append(
            "Add more detailed projects and implementation details"
        )

    if education_score < 80:
        improvements.append(
            "Improve the education section with clear academic details"
        )

    if certification_score < 80:
        improvements.append(
            "Add relevant certifications, courses, or workshops"
        )

    if experience_score < 80:
        improvements.append(
            "Add internships, practical experience, or stronger project impact"
        )

    if formatting_score < 80:
        improvements.append(
            "Add complete contact information such as email, LinkedIn, and GitHub"
        )

    return {
        "overall_score": overall_score,
        "category_scores": {
            "skills": skills_score,
            "projects": projects_score,
            "education": education_score,
            "certifications": certification_score,
            "experience": experience_score,
            "formatting": formatting_score,
        },
        "strengths": strengths,
        "improvements": improvements,
    }

