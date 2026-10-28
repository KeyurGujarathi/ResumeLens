import hashlib
import re
import secrets
import os

from datetime import datetime, timedelta, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models

from database import SessionLocal


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)
security = HTTPBearer()

# =========================================================
# DATABASE SESSION
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# REQUEST / RESPONSE SCHEMAS
# =========================================================

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class RegisterResponse(BaseModel):
    id: int
    name: str
    email: str


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    id: int
    name: str
    email: str
    token: str
    expires_at: datetime
    is_admin: bool = False


class MeResponse(BaseModel):
    id: int
    name: str
    email: str
    is_admin: bool = False


# =========================================================
# PASSWORD HASHING
# =========================================================

def hash_password(password: str) -> str:
    """
    Create a salted PBKDF2 password hash.
    """

    salt = secrets.token_bytes(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        120000,
    )

    return (
        "pbkdf2_sha256$"
        f"{salt.hex()}$"
        f"{password_hash.hex()}"
    )


def verify_password(
    password: str,
    stored_hash: str,
) -> bool:
    """
    Verify a password against the stored PBKDF2 hash.
    """

    try:
        algorithm, salt_hex, hash_hex = (
            stored_hash.split("$")
        )

        if algorithm != "pbkdf2_sha256":
            return False

        salt = bytes.fromhex(salt_hex)

        expected_hash = bytes.fromhex(
            hash_hex
        )

        actual_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            120000,
        )

        return secrets.compare_digest(
            actual_hash,
            expected_hash,
        )

    except (
        ValueError,
        TypeError,
    ):
        return False


# =========================================================
# EMAIL VALIDATION
# =========================================================

def is_valid_email(email: str) -> bool:
    pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

    return bool(
        re.match(
            pattern,
            email,
        )
    )


# =========================================================
# REGISTER
# =========================================================

@router.post(
    "/register",
    response_model=RegisterResponse,
)
def register_user(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    name = request.name.strip()
    email = request.email.strip().lower()
    password = request.password

    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

    if len(name) < 2:
        raise HTTPException(
            status_code=400,
            detail="Name must contain at least 2 characters.",
        )

    if not is_valid_email(email):
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid email address.",
        )

    if len(password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters.",
        )

    # -----------------------------------------------------
    # CHECK EXISTING USER
    # -----------------------------------------------------

    existing_user = (
        db.query(models.User)
        .filter(
            models.User.email == email
        )
        .first()
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists.",
        )

    # -----------------------------------------------------
    # CREATE USER
    # -----------------------------------------------------

    user = models.User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        created_at=datetime.now(timezone.utc),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    try:
        db.add(models.ActivityEvent(user_id=user.id, event="registered", page="/register", created_at=datetime.now(timezone.utc)))
        db.commit()
    except Exception:
        db.rollback()

    return RegisterResponse(
        id=user.id,
        name=user.name,
        email=user.email,
    )


# =========================================================
# LOGIN
# =========================================================

@router.post(
    "/login",
    response_model=LoginResponse,
)
def login_user(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    email = request.email.strip().lower()

    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    user = (
        db.query(models.User)
        .filter(
            models.User.email == email
        )
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    # -----------------------------------------------------
    # VERIFY PASSWORD
    # -----------------------------------------------------

    if not verify_password(
        request.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    # -----------------------------------------------------
    # CREATE SESSION
    # -----------------------------------------------------

    raw_token = secrets.token_urlsafe(48)

    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(days=7)
    )

    session = models.AuthSession(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        created_at=datetime.now(timezone.utc),
    )

    db.add(session)
    db.commit()

    try:
        db.add(models.ActivityEvent(user_id=user.id, event="login", page="/login", created_at=datetime.now(timezone.utc)))
        db.commit()
    except Exception:
        db.rollback()

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return LoginResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        token=raw_token,
        expires_at=expires_at,
        is_admin=bool(os.getenv("RESUMELENS_ADMIN_EMAIL", "").strip() and user.email.lower() == os.getenv("RESUMELENS_ADMIN_EMAIL", "").strip().lower()),
    )


# =========================================================
# CURRENT USER
# =========================================================
@router.get(
    "/me",
    response_model=MeResponse,
)
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
    db: Session = Depends(get_db),
):
    raw_token = credentials.credentials

    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    session = (
        db.query(models.AuthSession)
        .filter(
            models.AuthSession.token_hash
            == token_hash
        )
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired session.",
        )

    expires_at = session.expires_at

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(
            tzinfo=timezone.utc
        )

    if expires_at <= datetime.now(
        timezone.utc
    ):
        db.delete(session)
        db.commit()

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired session.",
        )

    user = (
        db.query(models.User)
        .filter(
            models.User.id == session.user_id
        )
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User account not found.",
        )

    return MeResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        is_admin=bool(os.getenv("RESUMELENS_ADMIN_EMAIL", "").strip() and user.email.lower() == os.getenv("RESUMELENS_ADMIN_EMAIL", "").strip().lower()),
    )

@router.post("/logout")
def logout_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """Revoke the current bearer session on the server."""
    token_hash = hashlib.sha256(credentials.credentials.encode("utf-8")).hexdigest()
    session = db.query(models.AuthSession).filter(models.AuthSession.token_hash == token_hash).first()
    if session is not None:
        db.delete(session)
        db.commit()
    return {"ok": True}
