from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.models import Project, ProjectSubmission, User
from app.schemas.schemas import (
    ProjectOut, ProjectSubmissionCreate, ProjectSubmissionOut, ProjectReviewRequest
)

router = APIRouter()

@router.get("", response_model=List[ProjectOut])
def list_projects(
    career_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    if career_id:
        query = query.filter(Project.career_id == career_id)
    return query.all()

@router.post("/submit", response_model=ProjectSubmissionOut)
def submit_project(
    submission_in: ProjectSubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == submission_in.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not submission_in.repository_url or "github.com" not in submission_in.repository_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid repository URL (e.g. GitHub) is required for verifiable project evaluation."
        )

    # Check existing submission
    existing = db.query(ProjectSubmission).filter(
        ProjectSubmission.user_id == current_user.id,
        ProjectSubmission.project_id == submission_in.project_id
    ).first()

    if existing:
        existing.repository_url = submission_in.repository_url
        existing.live_demo_url = submission_in.live_demo_url
        existing.submission_notes = submission_in.submission_notes
        existing.status = "pending"
        existing.submitted_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing)
        sub_out = ProjectSubmissionOut.model_validate(existing)
        sub_out.project_title = project.title
        return sub_out

    submission = ProjectSubmission(
        project_id=submission_in.project_id,
        user_id=current_user.id,
        repository_url=submission_in.repository_url,
        live_demo_url=submission_in.live_demo_url,
        submission_notes=submission_in.submission_notes,
        status="pending"
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    sub_out = ProjectSubmissionOut.model_validate(submission)
    sub_out.project_title = project.title
    return sub_out

@router.get("/my-submissions", response_model=List[ProjectSubmissionOut])
def get_my_submissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    submissions = db.query(ProjectSubmission).filter(
        ProjectSubmission.user_id == current_user.id
    ).order_by(ProjectSubmission.submitted_at.desc()).all()

    out = []
    for s in submissions:
        p = db.query(Project).filter(Project.id == s.project_id).first()
        item = ProjectSubmissionOut.model_validate(s)
        item.project_title = p.title if p else s.project_id
        out.append(item)
    return out

@router.post("/review", response_model=ProjectSubmissionOut)
def review_project_submission(
    req: ProjectReviewRequest,
    current_user: User = Depends(require_role(["mentor", "admin"])),
    db: Session = Depends(get_db)
):
    sub = db.query(ProjectSubmission).filter(ProjectSubmission.id == req.submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    sub.status = req.status
    sub.reviewer_feedback = req.reviewer_feedback
    sub.reviewed_by = current_user.id
    sub.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(sub)

    p = db.query(Project).filter(Project.id == sub.project_id).first()
    sub_out = ProjectSubmissionOut.model_validate(sub)
    sub_out.project_title = p.title if p else sub.project_id
    return sub_out

