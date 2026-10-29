from typing import Dict, List, Any, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.models import (
    AssessmentAttempt, AssessmentQuestion, AssessmentAnswer,
    SkillAssessment, CareerProfile, CareerSkillRequirement, User
)

def score_assessment_attempt(
    db: Session,
    attempt: AssessmentAttempt,
    submitted_answers: Dict[str, str],
    time_spent_seconds: int
) -> Tuple[float, Dict[str, float], List[Dict[str, Any]], bool]:
    """
    Server-side scoring of an assessment attempt.
    Never trusts client scores. Compares submitted option against protected database answers.
    """
    # Fetch questions for this attempt
    # If attempt has recorded answers or we query questions from DB
    question_ids = list(submitted_answers.keys())
    questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.id.in_(question_ids)).all()
    q_map = {q.id: q for q in questions}

    total_questions = len(questions)
    if total_questions == 0:
        return 0.0, {}, [], False

    correct_count = 0
    category_totals: Dict[str, int] = {}
    category_correct: Dict[str, int] = {}
    review_items: List[Dict[str, Any]] = []

    # Clear any previous answers for this attempt if re-scored
    db.query(AssessmentAnswer).filter(AssessmentAnswer.attempt_id == attempt.id).delete()

    for q_id, selected_opt in submitted_answers.items():
        q = q_map.get(q_id)
        if not q:
            continue
        
        is_corr = (selected_opt == q.correct_option_id)
        if is_corr:
            correct_count += 1

        cat = q.category
        category_totals[cat] = category_totals.get(cat, 0) + 1
        if is_corr:
            category_correct[cat] = category_correct.get(cat, 0) + 1

        # Record answer record
        answer_rec = AssessmentAnswer(
            attempt_id=attempt.id,
            question_id=q.id,
            selected_option_id=selected_opt,
            is_correct=is_corr,
            answered_at=datetime.now(timezone.utc)
        )
        db.add(answer_rec)

        review_items.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "selected_option_id": selected_opt,
            "correct_option_id": q.correct_option_id,
            "is_correct": is_corr,
            "explanation": q.explanation
        })

        # Update Skill Proficiency for associated skills
        for skill_id in (q.relevant_skill_ids or []):
            update_skill_evidence(db, attempt.user_id, skill_id, is_corr)

    score_pct = round((correct_count / total_questions) * 100.0, 2)
    category_scores = {}
    for cat, tot in category_totals.items():
        corr = category_correct.get(cat, 0)
        category_scores[cat] = round((corr / tot) * 100.0, 1)

    passed = score_pct >= 60.0

    # Update Attempt record
    attempt.status = "submitted"
    attempt.submitted_at = datetime.now(timezone.utc)
    attempt.score_percentage = score_pct
    attempt.category_scores = category_scores
    attempt.time_spent_seconds = time_spent_seconds

    db.commit()
    return score_pct, category_scores, review_items, passed

def update_skill_evidence(db: Session, user_id: str, skill_id: str, is_correct: bool):
    """
    Adjusts skill proficiency incrementally based on verified assessment evidence.
    """
    skill_rec = db.query(SkillAssessment).filter(
        SkillAssessment.user_id == user_id,
        SkillAssessment.skill_id == skill_id
    ).first()

    if not skill_rec:
        initial_prof = 2.5 if is_correct else 1.5
        skill_rec = SkillAssessment(
            user_id=user_id,
            skill_id=skill_id,
            current_proficiency=initial_prof,
            target_proficiency=4.0,
            evidence_count=1,
            confidence_level="low",
            last_assessed_at=datetime.now(timezone.utc)
        )
        db.add(skill_rec)
    else:
        # Bayesian-style nudging
        delta = 0.5 if is_correct else -0.3
        new_prof = max(0.5, min(5.0, skill_rec.current_proficiency + delta))
        skill_rec.current_proficiency = round(new_prof, 2)
        skill_rec.evidence_count += 1
        skill_rec.confidence_level = "high" if skill_rec.evidence_count >= 5 else "medium"
        skill_rec.last_assessed_at = datetime.now(timezone.utc)

    db.commit()

def calculate_skill_gaps(db: Session, user_id: str, target_career_id: str) -> Dict[str, Any]:
    """
    Computes transparent skill gaps: Gap = Target Proficiency - Current Proficiency.
    Categorizes into strong, developing, needing attention, and unassessed.
    """
    career = db.query(CareerProfile).filter(CareerProfile.id == target_career_id).first()
    if not career:
        target_career_id = "full-stack-developer"
        career = db.query(CareerProfile).filter(CareerProfile.id == target_career_id).first()

    expectations = career.proficiency_expectations or {}
    user_skills = {
        sa.skill_id: sa
        for sa in db.query(SkillAssessment).filter(SkillAssessment.user_id == user_id).all()
    }

    strong_skills = []
    developing_skills = []
    needing_attention = []
    unassessed_skills = []
    total_gap_hours = 0
    total_target_prof = 0
    total_current_prof = 0

    for skill_id, target_prof in expectations.items():
        total_target_prof += target_prof
        sa = user_skills.get(skill_id)
        if sa:
            curr = sa.current_proficiency
            gap = max(0.0, target_prof - curr)
            total_current_prof += min(curr, target_prof)
            skill_info = {
                "skill_id": skill_id,
                "skill_name": skill_id.replace("-", " ").title(),
                "current_proficiency": curr,
                "target_proficiency": target_prof,
                "gap": round(gap, 2),
                "confidence": sa.confidence_level,
                "estimated_study_hours": int(gap * 15)
            }
            total_gap_hours += skill_info["estimated_study_hours"]

            if gap <= 0.5:
                strong_skills.append(skill_info)
            elif gap <= 1.5:
                developing_skills.append(skill_info)
            else:
                needing_attention.append(skill_info)
        else:
            # Not yet assessed
            curr = 1.0  # default baseline
            gap = target_prof - curr
            total_current_prof += curr
            skill_info = {
                "skill_id": skill_id,
                "skill_name": skill_id.replace("-", " ").title(),
                "current_proficiency": curr,
                "target_proficiency": target_prof,
                "gap": round(gap, 2),
                "confidence": "none (unassessed)",
                "estimated_study_hours": int(gap * 15)
            }
            total_gap_hours += skill_info["estimated_study_hours"]
            unassessed_skills.append(skill_info)

    match_pct = round((total_current_prof / max(total_target_prof, 1.0)) * 100.0, 1)

    # Priority skills: largest gap with critical importance
    recommended_priority = sorted(
        needing_attention + unassessed_skills,
        key=lambda x: x["gap"],
        reverse=True
    )

    return {
        "target_career_id": target_career_id,
        "target_career_title": career.title if career else target_career_id,
        "overall_match_percentage": min(match_pct, 100.0),
        "strong_skills": strong_skills,
        "developing_skills": developing_skills,
        "skills_needing_attention": needing_attention,
        "unassessed_skills": unassessed_skills,
        "recommended_priority_skills": recommended_priority[:5],
        "total_estimated_study_hours": total_gap_hours
    }

def generate_career_recommendations(
    db: Session,
    user: User,
    academic_interests: List[str] = None,
    existing_skills: List[str] = None,
    preferred_careers: List[str] = None
) -> Dict[str, Any]:
    """
    Transparent, explainable career recommendation engine.
    Combines stated interests, self-reported skills, and verified assessment scores.
    """
    careers = db.query(CareerProfile).all()
    user_interests = set(i.lower() for i in (academic_interests or user.academic_interests or []))
    user_skills_set = set(s.lower() for s in (existing_skills or user.existing_skills or []))
    user_preferred = set(c.lower() for c in (preferred_careers or user.preferred_careers or []))

    # Fetch verified user skill proficiencies
    assessed_skills = {
        sa.skill_id: sa.current_proficiency
        for sa in db.query(SkillAssessment).filter(SkillAssessment.user_id == user.id).all()
    }

    match_results = []

    for c in careers:
        score = 40.0  # baseline
        matching_skills = []
        missing_skills = []
        explanation_points = []

        # 1. Career preference boost
        if c.title.lower() in user_preferred or c.id.lower() in user_preferred:
            score += 20.0
            explanation_points.append(f"Explicitly noted in your career interest preferences.")

        # 2. Interest alignment
        interest_hits = 0
        for interest in user_interests:
            if any(term in c.overview.lower() or term in c.title.lower() for term in interest.split()):
                interest_hits += 1
        if interest_hits > 0:
            score += min(15.0, interest_hits * 7.5)
            explanation_points.append(f"Matches your academic interest in {', '.join(user_interests)}.")

        # 3. Required skills vs User skills
        expectations = c.proficiency_expectations or {}
        for req_skill, target_prof in expectations.items():
            req_tokens = set(req_skill.lower().replace("-", " ").split())
            has_assessed = req_skill in assessed_skills and assessed_skills[req_skill] >= 2.0
            
            # Check if any user skill has token overlap with required skill
            has_self_reported = False
            for u_skill in user_skills_set:
                u_tokens = set(u_skill.lower().replace("-", " ").replace("&", " ").split())
                if req_tokens.intersection(u_tokens):
                    has_self_reported = True
                    break

            if has_assessed or has_self_reported:
                matching_skills.append(req_skill.replace("-", " ").title())
                score += 8.0
            else:
                missing_skills.append(req_skill.replace("-", " ").title())

        # 4. Cap score at 95 (no false perfection claim)
        final_score = int(min(95, max(30, round(score))))
        confidence = "high" if len(assessed_skills) >= 3 else ("medium" if len(user_skills_set) >= 2 else "low")

        match_results.append({
            "career_id": c.id,
            "career_title": c.title,
            "estimated_match_score": final_score,
            "confidence_level": confidence,
            "explanation": " ".join(explanation_points) or f"Aligns with your profile skills and entry requirements for {c.title}.",
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "suggested_first_step": f"Complete diagnostic assessment for {c.title} and begin Stage 1 foundations."
        })

    # Sort descending by match score
    match_results.sort(key=lambda x: x["estimated_match_score"], reverse=True)
    top_rec = match_results[0] if match_results else None

    return {
        "recommended_careers": match_results,
        "top_recommendation": top_rec,
        "scoring_notes": "Scored using multi-factor heuristic: interest alignment, self-reported skills, and verified assessment evidence.",
        "disclaimer": "Scores are explainable heuristic estimates to guide learning, not guarantees of employment or definitive predictions."
    }
