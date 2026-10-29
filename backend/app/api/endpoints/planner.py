from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Roadmap, RoadmapTask, User
from app.schemas.schemas import WeeklyPlanOut, WeeklyPlanDay, RoadmapTaskOut, LogHoursRequest

router = APIRouter()

DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

@router.get("/weekly", response_model=WeeklyPlanOut)
def get_weekly_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    weekly_hours = current_user.available_hours_per_week or 14
    daily_budget = round(weekly_hours / 7.0, 1)

    roadmap = db.query(Roadmap).filter(
        Roadmap.user_id == current_user.id,
        Roadmap.status == "active"
    ).first()

    if not roadmap:
        from app.services.roadmap_engine import create_or_update_roadmap
        roadmap = create_or_update_roadmap(db, current_user, "full-stack-developer")

    active_tasks = [
        t for t in roadmap.tasks if t.status in ("in_progress", "available", "completed")
    ]
    completed_count = sum(1 for t in active_tasks if t.status == "completed")

    # Allocate tasks across days of week
    days_data: List[WeeklyPlanDay] = []
    task_idx = 0
    num_tasks = len(active_tasks)

    for i, day_name in enumerate(DAYS_OF_WEEK):
        day_tasks = []
        if task_idx < num_tasks:
            day_tasks.append(RoadmapTaskOut.model_validate(active_tasks[task_idx]))
            # If 2 tasks fit in daily budget or weekend
            if (i >= 5) and (task_idx + 1 < num_tasks):
                task_idx += 1
                day_tasks.append(RoadmapTaskOut.model_validate(active_tasks[task_idx]))
            task_idx += 1

        days_data.append(
            WeeklyPlanDay(
                day_name=day_name,
                allocated_hours=daily_budget,
                tasks=day_tasks
            )
        )

    return WeeklyPlanOut(
        current_week=1,
        weekly_target_hours=weekly_hours,
        scheduled_tasks_count=len(active_tasks),
        completed_tasks_count=completed_count,
        days=days_data
    )

