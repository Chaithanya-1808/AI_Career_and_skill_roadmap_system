import random
from typing import List
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import (
    AssessmentQuestion, AssessmentAttempt, AssessmentAnswer, User, CareerProfile
)
from app.schemas.schemas import (
    AssessmentStartRequest, AssessmentAttemptOut, AssessmentQuestionClient,
    AssessmentSubmitRequest, AssessmentResultOut, AnswerReviewItem, QuestionOption
)
from app.services.scoring_service import score_assessment_attempt

router = APIRouter()

TIME_LIMIT_MINUTES = 15

@router.post("/start", response_model=AssessmentAttemptOut)
def start_assessment(
    req: AssessmentStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Select appropriate questions
    query = db.query(AssessmentQuestion)
    if req.category:
        query = query.filter(AssessmentQuestion.category == req.category)
    
    questions = query.all()
    if not questions:
        # Fallback to all questions
        questions = db.query(AssessmentQuestion).all()

    # Randomize questions for integrity
    random.shuffle(questions)
    selected_questions = questions[:10]  # Standard 10-question diagnostic

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=TIME_LIMIT_MINUTES)

    career = db.query(CareerProfile).filter(CareerProfile.id == req.career_id).first()
    title = f"Diagnostic Assessment: {career.title if career else 'General Technical'}"

    attempt = AssessmentAttempt(
        user_id=current_user.id,
        career_id=req.career_id,
        title=title,
        category=req.category,
        started_at=now,
        expires_at=expires_at,
        status="in_progress",
        camera_monitoring_enabled=req.camera_monitoring_enabled,
        integrity_status="clean"
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # Sanitize questions: NEVER return correct_option_id
    client_questions: List[AssessmentQuestionClient] = []
    for q in selected_questions:
        opts = [QuestionOption(id=o["id"], text=o["text"]) for o in q.options]
        # Shuffle options
        random.shuffle(opts)
        client_questions.append(
            AssessmentQuestionClient(
                id=q.id,
                category=q.category,
                difficulty=q.difficulty,
                question_text=q.question_text,
                code_snippet=q.code_snippet,
                options=opts,
                relevant_skill_ids=q.relevant_skill_ids or []
            )
        )

    return AssessmentAttemptOut(
        id=attempt.id,
        title=attempt.title,
        category=attempt.category,
        career_id=attempt.career_id,
        started_at=attempt.started_at,
        expires_at=attempt.expires_at,
        time_limit_minutes=TIME_LIMIT_MINUTES,
        camera_monitoring_enabled=attempt.camera_monitoring_enabled,
        status=attempt.status,
        questions=client_questions
    )

@router.post("/submit", response_model=AssessmentResultOut)
def submit_assessment(
    req: AssessmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attempt = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.id == req.attempt_id,
        AssessmentAttempt.user_id == current_user.id
    ).first()

    if not attempt:
        raise HTTPException(status_code=404, detail="Assessment attempt not found or does not belong to you")

    if attempt.status != "in_progress":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit attempt: status is already '{attempt.status}'"
        )

    # Server-side timer verification (allow 60 seconds grace for network latency)
    now = datetime.now(timezone.utc)
    # Ensure attempt.expires_at is timezone-aware
    expires = attempt.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
        
    if now > (expires + timedelta(seconds=60)):
        attempt.status = "expired"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assessment submission rejected: time limit expired."
        )

    # Score attempt on server
    score_pct, category_scores, review_items, passed = score_assessment_attempt(
        db=db,
        attempt=attempt,
        submitted_answers=req.answers,
        time_spent_seconds=req.time_spent_seconds
    )

    review_out = [AnswerReviewItem(**r) for r in review_items]
    correct_count = sum(1 for r in review_items if r["is_correct"])

    next_action = "Great job! Explore your customized roadmap and begin Stage 1." if passed else "Review your answer explanations, study the recommended topics, and retake the diagnostic."

    return AssessmentResultOut(
        attempt_id=attempt.id,
        title=attempt.title,
        career_id=attempt.career_id,
        score_percentage=score_pct,
        passed=passed,
        total_questions=len(review_items),
        correct_answers_count=correct_count,
        category_scores=category_scores,
        time_spent_seconds=req.time_spent_seconds,
        integrity_status=attempt.integrity_status,
        review_items=review_out,
        next_recommended_action=next_action
    )

@router.get("/history")
def get_assessment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attempts = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.user_id == current_user.id
    ).order_by(AssessmentAttempt.created_at.desc()).all()

    return [
        {
            "id": a.id,
            "title": a.title,
            "career_id": a.career_id,
            "status": a.status,
            "score_percentage": a.score_percentage,
            "time_spent_seconds": a.time_spent_seconds,
            "started_at": a.started_at,
            "submitted_at": a.submitted_at,
            "camera_monitoring_enabled": a.camera_monitoring_enabled,
            "integrity_status": a.integrity_status
        }
        for a in attempts
    ]
