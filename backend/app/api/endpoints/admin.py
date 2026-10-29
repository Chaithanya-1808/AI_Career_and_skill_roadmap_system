from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import require_role
from app.models.models import (
    User, UserRole, AssessmentAttempt, Roadmap, ProjectSubmission,
    Certificate, AuditLog
)
from app.schemas.schemas import AdminStatsOut

router = APIRouter()

@router.get("/stats", response_model=AdminStatsOut)
def get_admin_stats(
    current_admin: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    total_students = db.query(UserRole).filter(UserRole.role == "student").count()
    total_assessments = db.query(AssessmentAttempt).count()
    total_roadmaps = db.query(Roadmap).count()
    total_projects = db.query(ProjectSubmission).count()
    total_certificates = db.query(Certificate).count()
    integrity_flagged = db.query(AssessmentAttempt).filter(AssessmentAttempt.integrity_status == "flagged").count()

    # Popular careers
    career_counts = db.query(
        Roadmap.career_id, func.count(Roadmap.id)
    ).group_by(Roadmap.career_id).all()

    popular_careers = [
        {"career_id": c[0], "count": c[1]} for c in career_counts
    ]

    return AdminStatsOut(
        total_students=total_students,
        total_assessments_taken=total_assessments,
        total_roadmaps_generated=total_roadmaps,
        total_projects_submitted=total_projects,
        total_certificates_issued=total_certificates,
        integrity_flagged_count=integrity_flagged,
        popular_careers=popular_careers
    )

@router.get("/integrity-flags")
def get_flagged_assessments(
    current_admin: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    flagged = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.integrity_status == "flagged"
    ).all()

    out = []
    for f in flagged:
        student = db.query(User).filter(User.id == f.user_id).first()
        out.append({
            "attempt_id": f.id,
            "student_name": student.full_name if student else "Unknown",
            "student_email": student.email if student else "",
            "assessment_title": f.title,
            "started_at": f.started_at,
            "submitted_at": f.submitted_at,
            "score_percentage": f.score_percentage,
            "integrity_summary": f.integrity_summary
        })
    return out

@router.post("/integrity-review/{attempt_id}")
def mark_integrity_reviewed(
    attempt_id: str,
    action: str = "reviewed",  # "reviewed" or "clean"
    current_admin: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    attempt = db.query(AssessmentAttempt).filter(AssessmentAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    attempt.integrity_status = action
    db.commit()
    return {"status": "success", "attempt_id": attempt.id, "new_status": attempt.integrity_status}

