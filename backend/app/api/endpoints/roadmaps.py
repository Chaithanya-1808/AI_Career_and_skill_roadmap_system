import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Roadmap, RoadmapTask, User, CareerProfile, RoadmapVersion
from app.schemas.schemas import (
    RoadmapOut, RoadmapGenerateRequest, RoadmapTaskUpdateStatus, RoadmapAdaptRequest
)
from app.services.roadmap_engine import create_or_update_roadmap, update_task_progress

router = APIRouter()

@router.get("/current", response_model=RoadmapOut)
def get_current_roadmap(
    career_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Roadmap).filter(
        Roadmap.user_id == current_user.id,
        Roadmap.status == "active"
    )
    if career_id:
        query = query.filter(Roadmap.career_id == career_id)

    roadmap = query.first()
    if not roadmap:
        # Automatically generate default roadmap for target career
        target_career = career_id or "full-stack-developer"
        roadmap = create_or_update_roadmap(db, current_user, target_career, force_regenerate=False)

    career = db.query(CareerProfile).filter(CareerProfile.id == roadmap.career_id).first()
    roadmap_out = RoadmapOut.model_validate(roadmap)
    roadmap_out.career_title = career.title if career else roadmap.career_id
    return roadmap_out

@router.post("/generate", response_model=RoadmapOut)
def generate_roadmap(
    req: RoadmapGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    roadmap = create_or_update_roadmap(
        db=db,
        user=current_user,
        career_id=req.career_id,
        force_regenerate=req.force_regenerate
    )
    career = db.query(CareerProfile).filter(CareerProfile.id == roadmap.career_id).first()
    roadmap_out = RoadmapOut.model_validate(roadmap)
    roadmap_out.career_title = career.title if career else roadmap.career_id
    return roadmap_out

@router.post("/tasks/{task_id}/status", response_model=RoadmapOut)
def update_task_status(
    task_id: str,
    req: RoadmapTaskUpdateStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(RoadmapTask).filter(RoadmapTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    roadmap = db.query(Roadmap).filter(Roadmap.id == task.roadmap_id).first()
    if not roadmap or roadmap.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this roadmap task")

    if task.status == "locked" and req.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot complete a locked task without fulfilling its prerequisite tasks."
        )

    updated_roadmap = update_task_progress(
        db=db,
        roadmap_id=roadmap.id,
        task_id=task.id,
        new_status=req.status,
        actual_hours=req.actual_hours_spent or 0.0,
        evidence_notes=req.evidence_notes
    )

    career = db.query(CareerProfile).filter(CareerProfile.id == updated_roadmap.career_id).first()
    roadmap_out = RoadmapOut.model_validate(updated_roadmap)
    roadmap_out.career_title = career.title if career else updated_roadmap.career_id
    return roadmap_out

@router.post("/adapt", response_model=RoadmapOut)
def adapt_roadmap(
    req: RoadmapAdaptRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Adaptive recalculation: adjusts study pace, hours, or career target.
    Preserves all completed tasks!
    """
    target_career = req.career_id or current_user.target_job_role or "full-stack-developer"
    active_roadmap = db.query(Roadmap).filter(
        Roadmap.user_id == current_user.id,
        Roadmap.career_id == target_career,
        Roadmap.status == "active"
    ).first()

    if not active_roadmap:
        active_roadmap = create_or_update_roadmap(db, current_user, target_career)

    if req.new_available_hours_per_week:
        current_user.available_hours_per_week = req.new_available_hours_per_week
    if req.new_target_timeline_weeks:
        current_user.target_timeline_weeks = req.new_target_timeline_weeks
    db.commit()

    # Recalculate task target weeks and estimated hours for pending tasks
    weekly_hours = current_user.available_hours_per_week or 14
    pending_tasks = [t for t in active_roadmap.tasks if t.status != "completed"]
    accumulated_hours = 0
    for t in pending_tasks:
        accumulated_hours += t.estimated_hours
        new_week = max(1, int(accumulated_hours / max(weekly_hours, 1)))
        t.target_week = new_week

    active_roadmap.adaptation_count += 1
    db.commit()

    # Record snapshot in RoadmapVersion
    new_version = RoadmapVersion(
        roadmap_id=active_roadmap.id,
        version_number=active_roadmap.adaptation_count + 1,
        change_reason=req.adaptation_reason,
        snapshot={"adapted_at": datetime.now().isoformat(), "weekly_hours": weekly_hours}
    )
    db.add(new_version)
    db.commit()

    career = db.query(CareerProfile).filter(CareerProfile.id == active_roadmap.career_id).first()
    roadmap_out = RoadmapOut.model_validate(active_roadmap)
    roadmap_out.career_title = career.title if career else active_roadmap.career_id
    return roadmap_out

