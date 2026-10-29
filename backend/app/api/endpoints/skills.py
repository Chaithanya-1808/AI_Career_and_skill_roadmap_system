from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Skill, SkillAssessment, User
from app.schemas.schemas import SkillOut, SkillAssessmentOut, SkillGapReport
from app.services.scoring_service import calculate_skill_gaps

router = APIRouter()

@router.get("", response_model=List[SkillOut])
def list_skills(db: Session = Depends(get_db)):
    skills = db.query(Skill).all()
    return skills

@router.get("/gap-report", response_model=SkillGapReport)
def get_gap_report(
    career_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_career = career_id or current_user.target_job_role or "full-stack-developer"
    report = calculate_skill_gaps(db, current_user.id, target_career)
    return report

@router.get("/my-assessments", response_model=List[SkillAssessmentOut])
def get_my_skill_assessments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(SkillAssessment).filter(SkillAssessment.user_id == current_user.id).all()
    out = []
    for r in records:
        skill = db.query(Skill).filter(Skill.id == r.skill_id).first()
        gap = max(0.0, r.target_proficiency - r.current_proficiency)
        out.append(
            SkillAssessmentOut(
                id=r.id,
                skill_id=r.skill_id,
                skill_name=skill.name if skill else r.skill_id,
                category=skill.category if skill else "General",
                current_proficiency=r.current_proficiency,
                target_proficiency=r.target_proficiency,
                gap=round(gap, 2),
                confidence_level=r.confidence_level,
                evidence_count=r.evidence_count,
                last_assessed_at=r.last_assessed_at
            )
        )
    return out
