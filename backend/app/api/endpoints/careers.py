from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import CareerProfile, User
from app.schemas.schemas import (
    CareerProfileOut, CareerSummaryOut, CareerRecommendationRequest,
    CareerRecommendationResponse
)
from app.services.scoring_service import generate_career_recommendations

router = APIRouter()

@router.get("", response_model=List[CareerSummaryOut])
def list_careers(db: Session = Depends(get_db)):
    careers = db.query(CareerProfile).all()
    return careers

@router.get("/{career_id}", response_model=CareerProfileOut)
def get_career(career_id: str, db: Session = Depends(get_db)):
    career = db.query(CareerProfile).filter(CareerProfile.id == career_id).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career profile not found")
    return career

@router.post("/recommend", response_model=CareerRecommendationResponse)
def recommend_careers(
    req: CareerRecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recommendation = generate_career_recommendations(
        db=db,
        user=current_user,
        academic_interests=req.academic_interests,
        existing_skills=req.existing_skills,
        preferred_careers=req.preferred_careers
    )
    return recommendation
