import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.models import MentorShare, User, Roadmap, AssessmentAttempt
from app.schemas.schemas import MentorShareCreate, MentorShareOut, MentorFeedbackRequest

router = APIRouter()

@router.post("/share", response_model=MentorShareOut)
def share_with_mentor(
    req: MentorShareCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    token = f"MSH-{uuid.uuid4().hex[:12].upper()}"
    mentor_user = db.query(User).filter(User.email == req.mentor_email).first()

    share = MentorShare(
        student_id=current_user.id,
        mentor_id=mentor_user.id if mentor_user else None,
        mentor_email=req.mentor_email,
        share_token=token,
        can_review_roadmaps=req.can_review_roadmaps,
        can_approve_projects=req.can_approve_projects,
        can_view_assessments=req.can_view_assessments,
        status="active"
    )
    db.add(share)
    db.commit()
    db.refresh(share)

    out = MentorShareOut.model_validate(share)
    out.student_name = current_user.full_name
    return out

@router.get("/my-shares", response_model=List[MentorShareOut])
def get_student_shares(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    shares = db.query(MentorShare).filter(MentorShare.student_id == current_user.id).all()
    out = []
    for s in shares:
        item = MentorShareOut.model_validate(s)
        item.student_name = current_user.full_name
        out.append(item)
    return out

@router.get("/my-students")
def get_mentor_students(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves students who explicitly shared their portfolio with this mentor.
    """
    shares = db.query(MentorShare).filter(
        (MentorShare.mentor_email == current_user.email) | (MentorShare.mentor_id == current_user.id),
        MentorShare.status == "active"
    ).all()

    students_data = []
    for s in shares:
        student = db.query(User).filter(User.id == s.student_id).first()
        if student:
            roadmap = db.query(Roadmap).filter(Roadmap.user_id == student.id, Roadmap.status == "active").first()
            attempts_count = db.query(AssessmentAttempt).filter(AssessmentAttempt.user_id == student.id).count()
            students_data.append({
                "share_id": s.id,
                "student_id": student.id,
                "student_name": student.full_name,
                "student_email": student.email,
                "target_career": student.target_job_role or "Full-Stack Developer",
                "roadmap_progress": roadmap.overall_progress_percentage if roadmap else 0.0,
                "assessments_completed": attempts_count,
                "can_approve_projects": s.can_approve_projects
            })
    return students_data
