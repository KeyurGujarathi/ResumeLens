from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)

from sqlalchemy.orm import relationship

from database import Base


def utc_now():
    return datetime.now(timezone.utc)


# =========================================================
# USERS
# =========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String,
        nullable=False,
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash = Column(
        String,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=utc_now,
        nullable=False,
    )

    sessions = relationship(
        "AuthSession",
        back_populates="user",
        cascade="all, delete-orphan",
    )


# =========================================================
# AUTH SESSIONS
# =========================================================

class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    token_hash = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    expires_at = Column(
        DateTime,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=utc_now,
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="sessions",
    )


# =========================================================
# COMPANY
# =========================================================

class Company(Base):
    __tablename__ = "companies"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String,
        unique=True,
        nullable=False,
    )

    board_token = Column(
        String,
        unique=True,
        nullable=False,
    )

    postings = relationship(
        "JobPosting",
        back_populates="company",
    )


# =========================================================
# JOB POSTING
# =========================================================

class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False,
    )

    external_id = Column(
        String,
        unique=True,
        nullable=False,
    )

    title = Column(
        String,
        nullable=False,
    )

    url = Column(String)

    description = Column(
        Text,
        nullable=False,
    )

    first_seen_at = Column(
        DateTime,
        default=utc_now,
        nullable=False,
    )

    last_seen_at = Column(
        DateTime,
        default=utc_now,
        nullable=False,
    )

    first_published_at = Column(
        DateTime,
        nullable=True,
    )

    company = relationship(
        "Company",
        back_populates="postings",
    )

    skills = relationship(
        "JobPostingSkill",
        back_populates="posting",
        cascade="all, delete-orphan",
    )

    career_domains = relationship(
        "JobPostingCareerDomain",
        back_populates="posting",
        cascade="all, delete-orphan",
    )


# =========================================================
# SKILL
# =========================================================

class Skill(Base):
    __tablename__ = "skills"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String,
        unique=True,
        nullable=False,
    )

    category = Column(String)

    postings = relationship(
        "JobPostingSkill",
        back_populates="skill",
    )


# =========================================================
# JOB POSTING ↔ SKILL
# =========================================================

class JobPostingSkill(Base):
    __tablename__ = "job_posting_skills"

    posting_id = Column(
        Integer,
        ForeignKey("job_postings.id"),
        primary_key=True,
    )

    skill_id = Column(
        Integer,
        ForeignKey("skills.id"),
        primary_key=True,
    )

    posting = relationship(
        "JobPosting",
        back_populates="skills",
    )

    skill = relationship(
        "Skill",
        back_populates="postings",
    )


# =========================================================
# CAREER DOMAIN
# =========================================================

class CareerDomain(Base):
    __tablename__ = "career_domains"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String,
        unique=True,
        nullable=False,
    )

    description = Column(Text)

    postings = relationship(
        "JobPostingCareerDomain",
        back_populates="domain",
        cascade="all, delete-orphan",
    )


# =========================================================
# JOB POSTING ↔ CAREER DOMAIN
# =========================================================

class JobPostingCareerDomain(Base):
    __tablename__ = "job_posting_career_domains"

    posting_id = Column(
        Integer,
        ForeignKey("job_postings.id"),
        primary_key=True,
    )

    career_domain_id = Column(
        Integer,
        ForeignKey("career_domains.id"),
        primary_key=True,
    )

    posting = relationship(
        "JobPosting",
        back_populates="career_domains",
    )

    domain = relationship(
        "CareerDomain",
        back_populates="postings",
    )

# =========================================================
# PER-USER SAVED APP DATA (resume, profile, progress, etc.)
# =========================================================
class UserData(Base):
    __tablename__ = "user_data"
    __table_args__ = (UniqueConstraint("user_id", "key", name="uq_user_data_key"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    key = Column(String(160), nullable=False)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# =========================================================
# MINIMAL PRODUCT ACTIVITY (no passwords/tokens/IP addresses)
# =========================================================
class ActivityEvent(Base):
    __tablename__ = "activity_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event = Column(String(80), nullable=False)
    page = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)
