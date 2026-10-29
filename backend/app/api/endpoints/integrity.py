from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, AssessmentAttempt
from app.schemas.schemas import IntegrityEventCreate, IntegrityReportOut
from app.services.integrity_service import record_integrity_event, get_integrity_report

router = APIRouter()

@router.post("/event")
def log_integrity_event(
    event_in: IntegrityEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attempt = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.id == event_in.attempt_id,
        AssessmentAttempt.user_id == current_user.id
    ).first()

    if not attempt:
        raise HTTPException(status_code=404, detail="Assessment attempt not found or not owned by you")

    event = record_integrity_event(
        db=db,
        attempt_id=event_in.attempt_id,
        event_type=event_in.event_type,
        details=event_in.details
    )
    return {"status": "recorded", "event_id": event.id, "attempt_status": attempt.integrity_status}

@router.get("/report/{attempt_id}", response_model=IntegrityReportOut)
def read_integrity_report(
    attempt_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attempt = db.query(AssessmentAttempt).filter(AssessmentAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Assessment attempt not found")

    # Only student owner, mentors, or admin can read
    roles = [r.role for r in current_user.roles]
    if attempt.user_id != current_user.id and "admin" not in roles and "mentor" not in roles:
        raise HTTPException(status_code=403, detail="Not authorized to view this integrity report")

    report = get_integrity_report(db, attempt_id)
    return IntegrityReportOut(**report)

