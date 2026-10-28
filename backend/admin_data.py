"""Authenticated user-data sync and privacy-conscious admin analytics API."""
import hashlib
import json
import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

import models
from database import SessionLocal

router = APIRouter(tags=["Saved data and admin"])
bearer = HTTPBearer(auto_error=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_user(credentials: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Sign in to continue.")
    token_hash = hashlib.sha256(credentials.credentials.encode("utf-8")).hexdigest()
    session = db.query(models.AuthSession).filter(models.AuthSession.token_hash == token_hash).first()
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")
    expiry = session.expires_at
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
    if expiry <= datetime.now(timezone.utc):
        db.delete(session)
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid or expired session.")
    user = db.query(models.User).filter(models.User.id == session.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Account not found.")
    return user


def is_admin(user):
    admin_email = os.getenv("RESUMELENS_ADMIN_EMAIL", "").strip().lower()
    return bool(admin_email and user.email.lower() == admin_email)


def require_admin(user=Depends(get_user)):
    if not is_admin(user):
        raise HTTPException(status_code=403, detail="Administrator access is required.")
    return user


class DataItem(BaseModel):
    key: str = Field(min_length=1, max_length=160)
    value: str = Field(max_length=2_000_000)


class ActivityItem(BaseModel):
    event: str = Field(min_length=1, max_length=80)
    page: str | None = Field(default=None, max_length=200)


@router.get("/api/data")
def get_saved_data(user=Depends(get_user), db: Session = Depends(get_db)):
    rows = db.query(models.UserData).filter(models.UserData.user_id == user.id).all()
    return {"items": [{"key": row.key, "value": row.value, "updated_at": row.updated_at.isoformat()} for row in rows]}


@router.put("/api/data")
def save_data(item: DataItem, user=Depends(get_user), db: Session = Depends(get_db)):
    row = db.query(models.UserData).filter(models.UserData.user_id == user.id, models.UserData.key == item.key).first()
    if row is None:
        row = models.UserData(user_id=user.id, key=item.key, value=item.value)
        db.add(row)
    else:
        row.value = item.value
        row.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"ok": True, "key": item.key}


@router.delete("/api/data/{key}")
def delete_saved_data(key: str, user=Depends(get_user), db: Session = Depends(get_db)):
    """Delete one saved item for the authenticated account only."""
    row = db.query(models.UserData).filter(models.UserData.user_id == user.id, models.UserData.key == key).first()
    if row is not None:
        db.delete(row)
        db.commit()
    return {"ok": True, "key": key}


@router.post("/api/data/import")
def import_data_if_missing(item: DataItem, user=Depends(get_user), db: Session = Depends(get_db)):
    """One-time migration path: never overwrite data already saved on the server."""
    row = db.query(models.UserData).filter(models.UserData.user_id == user.id, models.UserData.key == item.key).first()
    if row is None:
        db.add(models.UserData(user_id=user.id, key=item.key, value=item.value))
        db.commit()
        return {"ok": True, "imported": True, "key": item.key}
    return {"ok": True, "imported": False, "key": item.key}


@router.post("/api/activity")
def log_activity(item: ActivityItem, request: Request, user=Depends(get_user), db: Session = Depends(get_db)):
    allowed = {"page_view", "resume_saved", "resume_analyzed", "career_profile_saved", "skill_gap_viewed", "company_fit_viewed", "roadmap_viewed", "placement_progress_saved"}
    if item.event not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported activity event.")
    db.add(models.ActivityEvent(user_id=user.id, event=item.event, page=item.page, created_at=datetime.now(timezone.utc)))
    db.commit()
    return {"ok": True}


@router.get("/api/admin/overview")
def admin_overview(admin=Depends(require_admin), db: Session = Depends(get_db)):
    total_users = db.query(func.count(models.User.id)).scalar() or 0
    total_saved_items = db.query(func.count(models.UserData.id)).scalar() or 0
    total_events = db.query(func.count(models.ActivityEvent.id)).scalar() or 0
    recent_users = db.query(models.User).order_by(models.User.created_at.desc()).limit(100).all()
    recent_events = db.query(models.ActivityEvent).order_by(models.ActivityEvent.created_at.desc()).limit(100).all()
    user_lookup = {u.id: u for u in db.query(models.User).all()}
    return {
        "stats": {"total_users": total_users, "saved_items": total_saved_items, "activity_events": total_events},
        "users": [{"id": u.id, "name": u.name, "email": u.email, "created_at": u.created_at.isoformat() if u.created_at else None, "saved_items": db.query(func.count(models.UserData.id)).filter(models.UserData.user_id == u.id).scalar() or 0} for u in recent_users],
        "activity": [{"id": e.id, "user_id": e.user_id, "name": user_lookup[e.user_id].name if e.user_id in user_lookup else "Deleted user", "email": user_lookup[e.user_id].email if e.user_id in user_lookup else "", "event": e.event, "page": e.page, "created_at": e.created_at.isoformat() if e.created_at else None} for e in recent_events],
    }


@router.get("/api/admin/users/{user_id}/data")
def admin_user_data(user_id: int, admin=Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    rows = db.query(models.UserData).filter(models.UserData.user_id == user_id).order_by(models.UserData.key).all()
    # This endpoint is restricted to the configured admin account because it may contain resume/career information.
    return {"user": {"id": user.id, "name": user.name, "email": user.email}, "items": [{"key": r.key, "value": r.value, "updated_at": r.updated_at.isoformat()} for r in rows]}
