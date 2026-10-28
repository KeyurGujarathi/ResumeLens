from pydantic import BaseModel


class SkillCount(BaseModel):
    skill: str
    category: str | None
    posting_count: int


class SkillTrendPoint(BaseModel):
    week: str
    skill: str
    posting_count: int


class SkillTrendResponse(BaseModel):
    total_postings: int
    dated_postings: int
    undated_postings: int
    points: list[SkillTrendPoint]


class BulletFinding(BaseModel):
    type: str
    message: str


class BulletAnalysis(BaseModel):
    bullet: str
    findings: list[BulletFinding]


class BulletRequest(BaseModel):
    bullet: str


class CompanyFitRequest(BaseModel):
    company: str
    skills: list[str]
    career_interests: list[str] = []


class CompanyFitSkill(BaseModel):
    skill: str
    category: str | None
    posting_count: int
    percentage: float
    has_skill: bool
    gap: bool


class CompanyFitResponse(BaseModel):
    company: str
    total_postings: int
    skills: list[CompanyFitSkill]


# ---------------------------------------------------------
# CAREER PROFILE
# ---------------------------------------------------------

class CareerProfileRequest(BaseModel):
    branch: str
    career_interests: list[str] = []
    passion: str = ""


# ---------------------------------------------------------
# CAREER TRACK SKILL
# ---------------------------------------------------------

class CareerSkill(BaseModel):
    skill: str
    category: str
    posting_count: int | None
    has_skill: bool


# ---------------------------------------------------------
# CAREER TRACK
# ---------------------------------------------------------

class CareerTrack(BaseModel):
    career: str
    match_percentage: int
    matched_count: int
    missing_count: int
    relevant_skill_count: int
    matched_skills: list[CareerSkill]
    missing_skills: list[CareerSkill]


# ---------------------------------------------------------
# SKILL GAP RESPONSE
# ---------------------------------------------------------

class SkillGapResponse(BaseModel):
    branch: str
    career_interests: list[str]
    analysis_mode: str
    resume_skill_count: int
    career_tracks: list[CareerTrack]

# ---------------------------------------------------------
# JOB FIT
# ---------------------------------------------------------

class JobFitRequest(BaseModel):
    skills: list[str]


class JobFitSkill(BaseModel):
    skill: str
    category: str | None
    has_skill: bool


class JobFitJob(BaseModel):
    job_id: int
    title: str
    company: str
    url: str | None
    first_published_at: str | None
    match_percentage: int
    matched_skills: list[JobFitSkill]
    missing_skills: list[JobFitSkill]


class JobFitResponse(BaseModel):
    total_jobs_analyzed: int
    jobs: list[JobFitJob]