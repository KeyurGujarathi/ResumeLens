import io
import os

from sqlalchemy import func
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pypdf import PdfReader

from resume_scorer import calculate_resume_score
from taxonomy import extract_skills
from database import engine, Base, SessionLocal
import models
from auth import router as auth_router
from admin_data import router as data_admin_router

from schemas import (
    SkillCount,
    SkillTrendPoint,
    SkillTrendResponse,
    BulletRequest,
    BulletAnalysis,
    CompanyFitRequest,
    CompanyFitSkill,
    CompanyFitResponse,
)

from bullet_detector import analyze_bullet


# ---------------------------------------------------------
# DATABASE
# ---------------------------------------------------------

Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------
# FASTAPI APP
# ---------------------------------------------------------

app = FastAPI()

app.include_router(auth_router)
app.include_router(data_admin_router)
# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

_configured_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv("RESUMELENS_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]
_local_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_local_origins + _configured_origins,
    # Allows a phone on the same private Wi-Fi to use Vite's dev server.
    # Production origins should be explicitly configured with RESUMELENS_ALLOWED_ORIGINS.
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


# ---------------------------------------------------------
# DATABASE SESSION
# ---------------------------------------------------------

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------
# PASSION KEYWORDS
# ---------------------------------------------------------

PASSION_KEYWORDS = {
    "Software / IT": {
        "software": 4,
        "software development": 5,
        "web development": 5,
        "web developer": 5,
        "website": 3,
        "coding": 4,
        "programming": 4,
        "app development": 5,
        "application development": 5,
        "frontend": 5,
        "backend": 5,
        "full stack": 5,
        "javascript": 5,
        "react": 5,
        "python": 3,
        "java": 3,
        "developer": 3,
    },

    "AI / ML / Data": {
        "artificial intelligence": 6,
        "machine learning": 6,
        "deep learning": 6,
        "data science": 6,
        "data analysis": 5,
        "data analytics": 5,
        "computer vision": 6,
        "natural language processing": 6,
        "nlp": 5,
        "prediction": 3,
        "analytics": 3,
    },

    "Cloud / DevOps": {
        "cloud": 5,
        "aws": 6,
        "azure": 6,
        "google cloud": 6,
        "devops": 6,
        "docker": 5,
        "kubernetes": 6,
        "deployment": 4,
        "server": 3,
        "infrastructure": 4,
    },

    "Embedded / IoT / Robotics": {
        "robot": 7,
        "robots": 7,
        "robotics": 7,
        "embedded": 7,
        "embedded systems": 8,
        "microcontroller": 7,
        "microcontrollers": 7,
        "esp32": 8,
        "esp32-cam": 8,
        "arduino": 7,
        "stm32": 8,
        "iot": 7,
        "internet of things": 8,
        "firmware": 6,
        "sensor": 6,
        "sensors": 6,
        "automation": 5,
        "motor": 4,
        "motors": 4,
        "actuator": 5,
        "raspberry pi": 7,
    },

    "Electronics / Hardware": {
        "electronics": 7,
        "electronic": 7,
        "circuit": 6,
        "circuits": 6,
        "hardware": 6,
        "pcb": 7,
        "breadboard": 5,
        "digital electronics": 7,
        "analog electronics": 7,
        "components": 4,
        "instrumentation": 5,
        "wiring": 4,
        "oscilloscope": 6,
    },

    "VLSI / Semiconductor": {
        "vlsi": 8,
        "semiconductor": 7,
        "chip design": 8,
        "asic": 8,
        "fpga": 8,
        "rtl": 7,
        "verilog": 8,
        "systemverilog": 8,
        "digital design": 6,
        "ic design": 8,
        "chip": 5,
    },

    "Electrical / Core": {
        "electrical engineering": 7,
        "power systems": 7,
        "power electronics": 7,
        "control systems": 6,
        "electrical machines": 7,
        "motor control": 6,
        "transformer": 6,
        "control engineering": 6,
    },

    "Mechanical / Core": {
        "mechanical engineering": 8,
        "mechanical": 6,
        "cad": 5,
        "solidworks": 7,
        "catia": 7,
        "ansys": 6,
        "manufacturing": 6,
        "machine design": 7,
        "automobile": 6,
        "automotive": 6,
        "thermodynamics": 6,
        "fluid mechanics": 6,
        "designing machines": 7,
    },

    "Civil / Core": {
        "civil engineering": 8,
        "construction": 7,
        "structural engineering": 8,
        "structural design": 7,
        "architecture": 6,
        "building design": 7,
        "surveying": 7,
        "concrete": 7,
        "geotechnical engineering": 8,
        "roads": 5,
        "water resources": 6,
    },
}


# ---------------------------------------------------------
# CAREER DOMAIN SKILLS
# ---------------------------------------------------------

CAREER_DOMAIN_SKILLS = {
    "Software / IT": [
        ("Python", "Programming"),
        ("Java", "Programming"),
        ("C", "Programming"),
        ("C++", "Programming"),
        ("JavaScript", "Programming"),
        ("TypeScript", "Programming"),
        ("React", "Frontend"),
        ("HTML", "Frontend"),
        ("CSS", "Frontend"),
        ("Tailwind CSS", "Frontend"),
        ("Node.js", "Backend"),
        ("FastAPI", "Backend"),
        ("Django", "Backend"),
        ("SQL", "Database"),
        ("PostgreSQL", "Database"),
        ("MySQL", "Database"),
        ("MongoDB", "Database"),
        ("Git", "Cloud/DevOps"),
        ("Data Structures", "Practices"),
        ("Algorithms", "Practices"),
        ("System Design", "Practices"),
        ("Unit Testing", "Practices"),
    ],

    "AI / ML / Data": [
        ("Python", "Programming"),
        ("Machine Learning", "Data/ML"),
        ("Deep Learning", "Data/ML"),
        ("TensorFlow", "Data/ML"),
        ("PyTorch", "Data/ML"),
        ("Pandas", "Data/ML"),
        ("NumPy", "Data/ML"),
        ("Scikit-learn", "Data/ML"),
        ("NLP", "Data/ML"),
        ("Computer Vision", "Data/ML"),
        ("SQL", "Database"),
        ("Spark", "Data/ML"),
        ("Kafka", "Data/ML"),
        ("Airflow", "Data/ML"),
        ("Tableau", "Data/ML"),
        ("Power BI", "Data/ML"),
    ],

    "Cloud / DevOps": [
        ("Python", "Programming"),
        ("AWS", "Cloud/DevOps"),
        ("Azure", "Cloud/DevOps"),
        ("GCP", "Cloud/DevOps"),
        ("Docker", "Cloud/DevOps"),
        ("Kubernetes", "Cloud/DevOps"),
        ("Terraform", "Cloud/DevOps"),
        ("CI/CD", "Cloud/DevOps"),
        ("Linux", "Cloud/DevOps"),
        ("Git", "Cloud/DevOps"),
        ("Microservices", "Backend"),
    ],

    "Embedded / IoT / Robotics": [
        ("C", "Programming"),
        ("C++", "Programming"),
        ("Python", "Programming"),
        ("Embedded Systems", "Embedded"),
        ("Microcontrollers", "Embedded"),
        ("ESP32", "Embedded"),
        ("ESP32-CAM", "Embedded"),
        ("Arduino", "Embedded"),
        ("STM32", "Embedded"),
        ("8051 Microcontroller", "Embedded"),
        ("ARM Architecture", "Embedded"),
        ("RTOS", "Embedded"),
        ("Firmware", "Embedded"),
        ("IoT", "Embedded"),
        ("Sensors", "Embedded"),
        ("Motor Drivers", "Embedded"),
        ("Raspberry Pi", "Embedded"),
        ("Microprocessors & Microcontrollers", "Embedded"),
        ("Git", "Practices"),
    ],

    "Electronics / Hardware": [
        ("C", "Programming"),
        ("C++", "Programming"),
        ("ESP32", "Embedded"),
        ("Arduino", "Embedded"),
        ("STM32", "Embedded"),
        ("8051 Microcontroller", "Embedded"),
        ("ARM Architecture", "Embedded"),
        ("Microcontrollers", "Embedded"),
        ("Sensors", "Electronics"),
        ("PCB", "Electronics"),
        ("Circuit Design", "Electronics"),
        ("Analog Electronics", "Electronics"),
        ("Digital Electronics", "Electronics"),
        ("Oscilloscope", "Electronics"),
        ("Altium", "Electronics"),
        ("KiCad", "Electronics"),
        ("Microprocessors & Microcontrollers", "Electronics"),
        ("Signals & Systems", "Electronics"),
        ("Communication", "Electronics"),
    ],

    "VLSI / Semiconductor": [
        ("C", "Programming"),
        ("C++", "Programming"),
        ("Verilog", "VLSI"),
        ("SystemVerilog", "VLSI"),
        ("VLSI", "VLSI"),
        ("RTL", "VLSI"),
        ("FPGA", "VLSI"),
        ("ASIC", "VLSI"),
        ("Cadence", "VLSI"),
        ("Synopsys", "VLSI"),
        ("Digital Design", "VLSI"),
        ("Digital Electronics", "Electronics"),
        ("Linux", "Cloud/DevOps"),
        ("Git", "Practices"),
    ],

    "Electrical / Core": [
        ("C", "Programming"),
        ("C++", "Programming"),
        ("MATLAB", "Electrical"),
        ("Simulink", "Electrical"),
        ("Circuit Design", "Electrical"),
        ("Digital Electronics", "Electrical"),
        ("Analog Electronics", "Electrical"),
        ("Power Electronics", "Electrical"),
        ("Control Systems", "Electrical"),
        ("Sensors", "Electrical"),
        ("Microcontrollers", "Embedded"),
    ],

    "Mechanical / Core": [
        ("SolidWorks", "Mechanical"),
        ("CATIA", "Mechanical"),
        ("ANSYS", "Mechanical"),
        ("AutoCAD", "Mechanical"),
        ("GD&T", "Mechanical"),
        ("CNC", "Manufacturing"),
        ("Manufacturing", "Mechanical"),
        ("Thermodynamics", "Mechanical"),
        ("Fluid Mechanics", "Mechanical"),
        ("Mechanical Design", "Mechanical"),
        ("Machine Design", "Mechanical"),
    ],

    "Civil / Core": [
        ("AutoCAD", "Civil"),
        ("STAAD Pro", "Civil"),
        ("Revit", "Civil"),
        ("Civil 3D", "Civil"),
        ("Structural Design", "Civil"),
        ("Surveying", "Civil"),
        ("Construction", "Civil"),
        ("Geotechnical Engineering", "Civil"),
        ("Concrete Technology", "Civil"),
    ],

    "Other": [],
}


# ---------------------------------------------------------
# USER CAREER INTEREST → INTERNAL DOMAIN
# ---------------------------------------------------------

CAREER_INTEREST_DOMAIN = {
    # Software
    "Software / IT": "Software / IT",
    "Software Development": "Software / IT",
    "Web Development": "Software / IT",

    # AI / ML
    "AI / ML / Data": "AI / ML / Data",
    "AI / Machine Learning": "AI / ML / Data",
    "Data Science": "AI / ML / Data",

    # Cloud
    "Cloud / DevOps": "Cloud / DevOps",

    # Embedded
    "Embedded / IoT / Robotics": "Embedded / IoT / Robotics",
    "Embedded Systems": "Embedded / IoT / Robotics",
    "IoT": "Embedded / IoT / Robotics",
    "Robotics": "Embedded / IoT / Robotics",

    # Electronics
    "Electronics / Hardware": "Electronics / Hardware",
    "Electronics": "Electronics / Hardware",
    "Hardware": "Electronics / Hardware",

    # VLSI
    "VLSI / Semiconductor": "VLSI / Semiconductor",
    "VLSI": "VLSI / Semiconductor",
    "Semiconductor": "VLSI / Semiconductor",

    # Electrical
    "Electrical / Core": "Electrical / Core",
    "Electrical": "Electrical / Core",

    # Mechanical
    "Mechanical / Core": "Mechanical / Core",
    "Mechanical Design": "Mechanical / Core",
    "Manufacturing": "Mechanical / Core",
    "Automotive": "Mechanical / Core",

    # Civil
    "Civil / Core": "Civil / Core",
    "Construction / Structural": "Civil / Core",
    "Structural Design": "Civil / Core",

    # Other
    "Other": "Other",
}

# ---------------------------------------------------------
# PASSION DOMAIN DETECTION
# ---------------------------------------------------------

def detect_passion_domains(passion):
    text = passion.lower().strip()

    if not text:
        return []

    domain_scores = {}

    for domain, keywords in PASSION_KEYWORDS.items():
        score = 0

        for keyword, weight in keywords.items():
            if keyword in text:
                score += weight

        if score > 0:
            domain_scores[domain] = score

    if not domain_scores:
        return []

    MIN_SCORE = 5

    domain_scores = {
        domain: score
        for domain, score in domain_scores.items()
        if score >= MIN_SCORE
    }

    if not domain_scores:
        return []

    ranked_domains = sorted(
        domain_scores.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    strongest_score = ranked_domains[0][1]

    detected_domains = []

    for domain, score in ranked_domains:
        if score >= MIN_SCORE and score >= strongest_score * 0.45:
            detected_domains.append(domain)

    return detected_domains[:3]


# ---------------------------------------------------------
# DOMAIN FALLBACK SKILLS
# ---------------------------------------------------------

def get_domain_fallback_skills(
    domains,
    resume_skills_normalized,
):
    market_skills = []

    seen_skills = set()

    for domain in domains:

        domain_skills = CAREER_DOMAIN_SKILLS.get(
            domain,
            [],
        )

        for skill_name, category in domain_skills:

            skill_key = skill_name.lower()

            if skill_key in seen_skills:
                continue

            seen_skills.add(skill_key)

            has_skill = (
                skill_key in resume_skills_normalized
            )

            market_skills.append(
                {
                    "skill": skill_name,
                    "category": category,
                    "posting_count": None,
                    "has_skill": has_skill,
                    "source": "career_profile",
                }
            )

    return market_skills


# ---------------------------------------------------------
# ROOT
# ---------------------------------------------------------

@app.get("/")
def read_root():
    return {
        "status": "ResumeLens backend is alive"
    }


# ---------------------------------------------------------
# SKILL COUNTS
# ---------------------------------------------------------

@app.get(
    "/api/skills/counts",
    response_model=list[SkillCount],
)
def get_skill_counts(
    db: Session = Depends(get_db),
):

    rows = (
        db.query(
            models.Skill.name,
            models.Skill.category,
            func.count(
                models.JobPostingSkill.posting_id
            ).label("posting_count"),
        )
        .join(
            models.JobPostingSkill,
            models.JobPostingSkill.skill_id
            == models.Skill.id,
        )
        .group_by(models.Skill.id)
        .order_by(
            func.count(
                models.JobPostingSkill.posting_id
            ).desc()
        )
        .all()
    )

    return [
        SkillCount(
            skill=name,
            category=category,
            posting_count=count,
        )
        for name, category, count in rows
    ]


# ---------------------------------------------------------
# SKILL TRENDS
# ---------------------------------------------------------

@app.get(
    "/api/skills/trends",
    response_model=SkillTrendResponse,
)
def get_skill_trends(
    skill: str | None = None,
    db: Session = Depends(get_db),
):

    total_postings = (
        db.query(models.JobPosting).count()
    )

    dated_postings = (
        db.query(models.JobPosting)
        .filter(
            models.JobPosting.first_published_at.isnot(None)
        )
        .count()
    )

    undated_postings = (
        total_postings - dated_postings
    )

    query = (
        db.query(
            func.strftime(
                "%Y-%W",
                models.JobPosting.first_published_at,
            ).label("week"),
            models.Skill.name,
            func.count(
                models.JobPostingSkill.posting_id
            ).label("posting_count"),
        )
        .join(
            models.JobPostingSkill,
            models.JobPostingSkill.skill_id
            == models.Skill.id,
        )
        .join(
            models.JobPosting,
            models.JobPosting.id
            == models.JobPostingSkill.posting_id,
        )
        .filter(
            models.JobPosting.first_published_at.isnot(None)
        )
    )

    if skill:
        query = query.filter(
            func.lower(models.Skill.name)
            == skill.lower()
        )

    rows = (
        query
        .group_by(
            func.strftime(
                "%Y-%W",
                models.JobPosting.first_published_at,
            ),
            models.Skill.id,
        )
        .order_by(
            func.strftime(
                "%Y-%W",
                models.JobPosting.first_published_at,
            ),
            models.Skill.name,
        )
        .all()
    )

    points = [
        SkillTrendPoint(
            week=week,
            skill=skill_name,
            posting_count=count,
        )
        for week, skill_name, count in rows
    ]

    return SkillTrendResponse(
        total_postings=total_postings,
        dated_postings=dated_postings,
        undated_postings=undated_postings,
        points=points,
    )


# ---------------------------------------------------------
# SKILL RANKINGS
# ---------------------------------------------------------

@app.get("/api/skills/rankings")
def get_skill_rankings(
    db: Session = Depends(get_db),
):

    rows = (
        db.query(
            models.Skill.name,
            func.count(
                models.JobPostingSkill.posting_id
            ).label("posting_count"),
        )
        .join(
            models.JobPostingSkill,
            models.JobPostingSkill.skill_id
            == models.Skill.id,
        )
        .join(
            models.JobPosting,
            models.JobPosting.id
            == models.JobPostingSkill.posting_id,
        )
        .group_by(models.Skill.id)
        .order_by(
            func.count(
                models.JobPostingSkill.posting_id
            ).desc()
        )
        .all()
    )

    return [
        {
            "skill": name,
            "posting_count": count,
        }
        for name, count in rows
    ]
# ---------------------------------------------------------
# COMPANY LIST
# ---------------------------------------------------------

@app.get("/api/companies")
def get_companies(
    db: Session = Depends(get_db),
):

    rows = (
        db.query(
            models.Company.name,
            func.count(
                models.JobPosting.id
            ).label("posting_count"),
        )
        .outerjoin(
            models.JobPosting,
            models.JobPosting.company_id
            == models.Company.id,
        )
        .group_by(
            models.Company.id
        )
        .order_by(
            func.lower(
                models.Company.name
            )
        )
        .all()
    )

    return [
        {
            "name": name,
            "posting_count": posting_count,
        }
        for name, posting_count in rows
    ]

# ---------------------------------------------------------
# CAREER PROFILE
# ---------------------------------------------------------

@app.post("/api/career-profile")
async def save_career_profile(request: dict):

    branch = request.get("branch", "")
    career_interests = request.get(
        "career_interests",
        [],
    )
    passion = request.get(
        "passion",
        "",
    )

    if not branch:
        raise HTTPException(
            status_code=400,
            detail="Branch is required.",
        )

    if not isinstance(career_interests, list):
        raise HTTPException(
            status_code=400,
            detail="career_interests must be a list.",
        )

    detected_domains = detect_passion_domains(
        passion
    )

    combined_interests = []

    for interest in career_interests:

        if interest not in combined_interests:
            combined_interests.append(interest)

    return {
        "branch": branch,
        "career_interests": career_interests,
        "passion": passion,
        "detected_career_domains": detected_domains,
        "combined_career_domains": combined_interests,
        "analysis_mode": "career_profile",
    }


# ---------------------------------------------------------
# SKILL GAP
# ---------------------------------------------------------

@app.post("/api/skill-gap")
def calculate_skill_gap(
    request: dict,
    db: Session = Depends(get_db),
):

    resume_skills = request.get(
        "skills",
        [],
    )

    branch = request.get(
        "branch",
        "",
    )

    career_interests = request.get(
        "career_interests",
        [],
    )

    passion = request.get(
        "passion",
        "",
    )

    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

    if not isinstance(resume_skills, list):

        raise HTTPException(
            status_code=400,
            detail="skills must be a list.",
        )

    if not isinstance(career_interests, list):

        raise HTTPException(
            status_code=400,
            detail="career_interests must be a list.",
        )

    # -----------------------------------------------------
    # NORMALIZE RESUME SKILLS
    # -----------------------------------------------------

    resume_skills_normalized = {
        str(skill).strip().lower()
        for skill in resume_skills
        if str(skill).strip()
    }

    # -----------------------------------------------------
    # REMOVE DUPLICATE INTERESTS
    # -----------------------------------------------------

    unique_interests = []

    for interest in career_interests:

        if not isinstance(interest, str):
            continue

        cleaned_interest = interest.strip()

        if (
            cleaned_interest
            and cleaned_interest
            not in unique_interests
        ):
            unique_interests.append(
                cleaned_interest
            )

    # -----------------------------------------------------
    # BUILD CAREER TRACKS
    # -----------------------------------------------------

    career_tracks = []

    for interest in unique_interests:

        internal_domain = CAREER_INTEREST_DOMAIN.get(
            interest,
            "Other",
        )

        domain_skills = CAREER_DOMAIN_SKILLS.get(
            internal_domain,
            [],
        )

        # -------------------------------------------------
        # LIMIT TO UNIQUE SKILLS
        # -------------------------------------------------

        unique_domain_skills = []

        seen_skills = set()

        for skill_name, category in domain_skills:

            skill_key = skill_name.lower()

            if skill_key in seen_skills:
                continue

            seen_skills.add(skill_key)

            unique_domain_skills.append(
                (
                    skill_name,
                    category,
                )
            )

        # -------------------------------------------------
        # MARKET DATA
        # -------------------------------------------------

        market_counts = {}

        if unique_domain_skills:

            skill_names = [
                skill_name
                for skill_name, category
                in unique_domain_skills
            ]

            rows = (
                db.query(
                    models.Skill.name,
                    models.Skill.category,
                    func.count(
                        models.JobPostingSkill.posting_id
                    ).label("posting_count"),
                )
                .join(
                    models.JobPostingSkill,
                    models.JobPostingSkill.skill_id
                    == models.Skill.id,
                )
                .group_by(
                    models.Skill.id
                )
                .all()
            )

            requested_skill_keys = {
                name.lower()
                for name in skill_names
            }

            for (
                name,
                category,
                posting_count,
            ) in rows:

                if (
                    name.lower()
                    in requested_skill_keys
                ):
                    market_counts[
                        name.lower()
                    ] = {
                        "name": name,
                        "category": category,
                        "posting_count": posting_count,
                    }

        # -------------------------------------------------
        # MATCHED / MISSING
        # -------------------------------------------------

        matched_skills = []
        missing_skills = []

        for (
            skill_name,
            category,
        ) in unique_domain_skills:

            skill_key = skill_name.lower()

            has_skill = (
                skill_key
                in resume_skills_normalized
            )

            market_data = market_counts.get(
                skill_key
            )

            posting_count = (
                market_data["posting_count"]
                if market_data
                else None
            )

            skill_item = {
                "skill": skill_name,
                "category": category,
                "posting_count": posting_count,
                "source": "career_profile",
            }

            if has_skill:

                matched_skills.append(
                    skill_item
                )

            else:

                missing_skills.append(
                    skill_item
                )

        # -------------------------------------------------
        # SORT MISSING SKILLS
        # -------------------------------------------------

        missing_skills.sort(
            key=lambda item: (
                item["posting_count"]
                if item["posting_count"]
                is not None
                else -1
            ),
            reverse=True,
        )

        # -------------------------------------------------
        # MATCH PERCENTAGE
        # -------------------------------------------------

        relevant_skill_count = len(
            unique_domain_skills
        )

        matched_count = len(
            matched_skills
        )

        missing_count = len(
            missing_skills
        )

        if relevant_skill_count > 0:

            match_percentage = round(
                (
                    matched_count
                    / relevant_skill_count
                )
                * 100
            )

        else:

            match_percentage = 0

        # -------------------------------------------------
        # CAREER TRACK
        # -------------------------------------------------

        career_tracks.append(
            {
                "career": interest,
                "internal_domain": internal_domain,
                "relevant_skill_count": (
                    relevant_skill_count
                ),
                "matched_count": matched_count,
                "missing_count": missing_count,
                "match_percentage": (
                    match_percentage
                ),
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
            }
        )

    # -----------------------------------------------------
    # PASSION INFORMATION
    # -----------------------------------------------------

    detected_domains = detect_passion_domains(
        passion
    )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "branch": branch,
        "career_interests": unique_interests,
        "passion": passion,
        "detected_career_domains": detected_domains,
        "resume_skill_count": len(
            resume_skills_normalized
        ),
        "analysis_mode": "career_profile",
        "skill_source": "provided_resume_skills",
        "career_tracks": career_tracks,
    }


# ---------------------------------------------------------
# BULLET ANALYZER
# ---------------------------------------------------------

@app.post(
    "/api/bullets/analyze",
    response_model=BulletAnalysis,
)
def analyze_resume_bullet(
    request: BulletRequest,
):

    findings = analyze_bullet(
        request.bullet
    )

    return BulletAnalysis(
        bullet=request.bullet,
        findings=findings,
    )


# ---------------------------------------------------------
# COMPANY FIT
# ---------------------------------------------------------

@app.post(
    "/api/company-fit",
    response_model=CompanyFitResponse,
)
def get_company_fit(
    request: CompanyFitRequest,
    db: Session = Depends(get_db),
):
    # FIND COMPANY
    company = (
        db.query(models.Company)
        .filter(
            func.lower(models.Company.name)
            == request.company.lower()
        )
        .first()
    )

    if company is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Company '{request.company}' "
                "not found"
            ),
        )

    # TOTAL COMPANY JOB POSTINGS
    total_postings = (
        db.query(models.JobPosting)
        .filter(
            models.JobPosting.company_id
            == company.id
        )
        .count()
    )

    if total_postings == 0:
        return CompanyFitResponse(
            company=company.name,
            total_postings=0,
            skills=[],
        )

    # GET COMPANY SKILL DEMAND
    rows = (
        db.query(
            models.Skill.name,
            models.Skill.category,
            func.count(
                models.JobPostingSkill.posting_id
            ).label("posting_count"),
        )
        .join(
            models.JobPostingSkill,
            models.JobPostingSkill.skill_id
            == models.Skill.id,
        )
        .join(
            models.JobPosting,
            models.JobPosting.id
            == models.JobPostingSkill.posting_id,
        )
        .filter(
            models.JobPosting.company_id
            == company.id
        )
        .group_by(models.Skill.id)
        .order_by(
            func.count(
                models.JobPostingSkill.posting_id
            ).desc()
        )
        .all()
    )

    # USER RESUME SKILLS
    user_skills = {
        skill.strip().lower()
        for skill in request.skills
        if isinstance(skill, str)
        and skill.strip()
    }

    # CAREER-AWARE SKILL FILTER
    selected_career_skills = set()

    for interest in request.career_interests:
        domain = CAREER_INTEREST_DOMAIN.get(
            interest,
            interest,
        )

        domain_skills = CAREER_DOMAIN_SKILLS.get(
            domain,
            [],
        )

        for skill in domain_skills:
            # Some skill definitions may contain
            # additional information as tuples.
            if isinstance(skill, (tuple, list)):
                skill_name = skill[0]
            else:
                skill_name = skill

            if isinstance(skill_name, str):
                selected_career_skills.add(
                    skill_name.strip().lower()
                )

    # FILTER COMPANY SKILLS
    if selected_career_skills:
        filtered_rows = [
            row
            for row in rows
            if isinstance(row[0], str)
            and row[0].strip().lower()
            in selected_career_skills
        ]
    else:
        filtered_rows = rows

    # BUILD COMPANY FIT RESULT
    skills = []

    for name, category, count in filtered_rows:
        skill_name_lower = (
            name.strip().lower()
            if isinstance(name, str)
            else ""
        )

        skills.append(
            CompanyFitSkill(
                skill=name,
                category=category,
                posting_count=count,
                percentage=round(
                    (
                        count
                        / total_postings
                    )
                    * 100,
                    2,
                ),
                has_skill=(
                    skill_name_lower
                    in user_skills
                ),
                gap=(
                    skill_name_lower
                    not in user_skills
                ),
            )
        )

    return CompanyFitResponse(
        company=company.name,
        total_postings=total_postings,
        skills=skills,
    )
# ---------------------------------------------------------
# RESUME ANALYZER
# ---------------------------------------------------------

@app.post("/api/resume/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    if file.content_type != "application/pdf":

        raise HTTPException(
            status_code=400,
            detail=(
                "Only PDF files are supported."
            ),
        )

    contents = await file.read()

    pdf_file = io.BytesIO(
        contents
    )

    reader = PdfReader(
        pdf_file
    )

    extracted_text = ""

    for page in reader.pages:

        page_text = (
            page.extract_text()
            or ""
        )

        extracted_text += (
            page_text + "\n"
        )

    # ---------------------------------------------------------
    # DEBUG
    # ---------------------------------------------------------

    print()
    print(
        "=============================================="
    )
    print(
        "EXTRACTED RESUME TEXT"
    )
    print(
        "=============================================="
    )
    print(
        repr(extracted_text)
    )
    print(
        "=============================================="
    )
    print()

    # ---------------------------------------------------------
    # SKILL DETECTION
    # ---------------------------------------------------------

    detected_skills = extract_skills(
        extracted_text
    )

    detected_skills = sorted(
        detected_skills,
        key=str.lower,
    )

    # ---------------------------------------------------------
    # RESUME SCORE
    # ---------------------------------------------------------

    resume_score = (
        calculate_resume_score(
            extracted_text,
            detected_skills,
        )
    )

    # ---------------------------------------------------------
    # RESPONSE
    # ---------------------------------------------------------

    return {
        "filename": file.filename,
        "pages": len(reader.pages),
        "text_length": len(
            extracted_text
        ),
        "detected_skills": detected_skills,
        "skill_count": len(
            detected_skills
        ),
        "full_text": extracted_text,
        "text_preview": extracted_text[
            :1000
        ],
        "resume_score": resume_score,
    }
@app.post("/api/career-roadmap")
def get_career_roadmap(
    request: dict,
    db: Session = Depends(get_db),
):
    try:
        skills = request.get("skills", [])
        branch = request.get("branch", "")
        career_interests = request.get(
            "career_interests",
            [],
        )

        user_skills = {
            skill.strip().lower()
            for skill in skills
            if isinstance(skill, str)
            and skill.strip()
        }

        # ---------------------------------------------------------
        # PRIMARY DOMAIN FOR OVERLAPPING SKILLS
        # ---------------------------------------------------------

        PRIMARY_SKILL_DOMAIN = {
            "stm32": "Embedded / IoT / Robotics",
            "rtos": "Embedded / IoT / Robotics",
            "firmware": "Embedded / IoT / Robotics",
            "microcontrollers": "Embedded / IoT / Robotics",
            "iot": "Embedded / IoT / Robotics",
            "motor drivers": "Embedded / IoT / Robotics",
            "raspberry pi": "Embedded / IoT / Robotics",
            "microprocessors & microcontrollers":
                "Embedded / IoT / Robotics",
            "esp32": "Embedded / IoT / Robotics",
            "esp32-cam": "Embedded / IoT / Robotics",
            "arduino": "Embedded / IoT / Robotics",
            "8051 microcontroller":
                "Embedded / IoT / Robotics",
            "arm architecture":
                "Embedded / IoT / Robotics",
            "embedded systems":
                "Embedded / IoT / Robotics",

            "pcb": "Electronics / Hardware",
            "circuit design": "Electronics / Hardware",
            "analog electronics":
                "Electronics / Hardware",
            "digital electronics":
                "Electronics / Hardware",
            "sensors": "Electronics / Hardware",
            "oscilloscope": "Electronics / Hardware",
            "altium": "Electronics / Hardware",
            "kicad": "Electronics / Hardware",
            "signals & systems":
                "Electronics / Hardware",
            "communication":
                "Electronics / Hardware",
        }

        # ---------------------------------------------------------
        # PRACTICAL LEARNING PRIORITY
        # ---------------------------------------------------------
        #
        # Lower number = recommended earlier.
        #
        # This is NOT job-market demand.
        # It is used only when skills have little/no market data.
        # ---------------------------------------------------------

        LEARNING_PRIORITY = {
            # Software / IT
            "sql": 1,
            "java": 2,
            "javascript": 3,
            "typescript": 4,
            "c++": 5,
            "react": 6,
            "node.js": 7,
            "postgresql": 8,
            "mongodb": 9,
            "algorithms": 10,
            "system design": 11,

            # Embedded
            "microcontrollers": 1,
            "stm32": 2,
            "firmware": 3,
            "rtos": 4,
            "iot": 5,
            "motor drivers": 6,
            "raspberry pi": 7,
            "microprocessors & microcontrollers": 8,

            # Electronics / Hardware
            "pcb": 1,
            "circuit design": 2,
            "digital electronics": 3,
            "analog electronics": 4,
            "sensors": 5,
            "oscilloscope": 6,
            "kicad": 7,
            "altium": 8,
            "signals & systems": 9,
            "communication": 10,
        }

        # ---------------------------------------------------------
        # BUILD MISSING SKILLS
        # ---------------------------------------------------------

        selected_career_skills = {}

        for interest in career_interests:
            domain = CAREER_INTEREST_DOMAIN.get(
                interest,
                interest,
            )

            domain_skills = CAREER_DOMAIN_SKILLS.get(
                domain,
                [],
            )

            for skill in domain_skills:

                if isinstance(skill, (tuple, list)):
                    skill_name = skill[0]
                else:
                    skill_name = skill

                if not isinstance(skill_name, str):
                    continue

                skill_name = skill_name.strip()

                if not skill_name:
                    continue

                skill_key = skill_name.lower()

                if skill_key in user_skills:
                    continue

                primary_domain = PRIMARY_SKILL_DOMAIN.get(
                    skill_key
                )

                career_domain = (
                    primary_domain
                    if primary_domain
                    else domain
                )

                if skill_key not in selected_career_skills:
                    selected_career_skills[skill_key] = {
                        "skill": skill_name,
                        "career_domain": career_domain,
                    }

        # ---------------------------------------------------------
        # BUILD ROADMAP
        # ---------------------------------------------------------

        roadmap = []

        for skill_key, skill_info in selected_career_skills.items():

            skill_name = skill_info["skill"]
            career_domain = skill_info["career_domain"]

            skill_record = (
                db.query(models.Skill)
                .filter(
                    func.lower(models.Skill.name)
                    == skill_key
                )
                .first()
            )

            posting_count = 0
            category = "General"

            if skill_record:
                category = (
                    skill_record.category
                    or "General"
                )

                posting_count = (
                    db.query(
                        models.JobPostingSkill
                    )
                    .filter(
                        models.JobPostingSkill.skill_id
                        == skill_record.id
                    )
                    .count()
                )

            if posting_count >= 100:
                priority = "High"
                recommendation = "Start learning"
                reason = (
                    "Frequently requested in "
                    "the current job market."
                )

            elif posting_count >= 20:
                priority = "Medium"
                recommendation = (
                    "Learn after high-priority skills"
                )
                reason = (
                    "Shows moderate demand in "
                    "the current job-market data."
                )

            elif posting_count > 0:
                priority = "Low"
                recommendation = "Consider later"
                reason = (
                    "Appears in the dataset, "
                    "but current demand is "
                    "relatively lower."
                )

            else:
                priority = "Limited Data"
                recommendation = (
                    "Consider based on career direction"
                )
                reason = (
                    "This skill is relevant to "
                    "your selected career direction, "
                    "but the current ResumeLens job "
                    "dataset has no matching "
                    "posting data for it."
                )

            roadmap.append(
                {
                    "skill": skill_name,
                    "career_domain": career_domain,
                    "category": category,
                    "posting_count": posting_count,
                    "learning_priority":
                        LEARNING_PRIORITY.get(
                            skill_key,
                            999,
                        ),
                    "priority": priority,
                    "recommendation": recommendation,
                    "reason": reason,
                }
            )

        roadmap.sort(
            key=lambda item: item["posting_count"],
            reverse=True,
        )

        return {
            "branch": branch,
            "career_interests": career_interests,
            "roadmap": roadmap,
        }

    except Exception as e:
        print(
            "Career Roadmap Error:",
            repr(e),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Career roadmap failed: {str(e)}"
            ),
        )