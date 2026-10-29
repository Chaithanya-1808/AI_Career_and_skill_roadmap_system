from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator

# ----------------- Auth & Profile -----------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    role: Optional[str] = "student"  # default student, only bootstrap creates admin

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRoleOut(BaseModel):
    role: str
    created_at: datetime

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    qualification: Optional[str] = None
    institution: Optional[str] = None
    current_semester: Optional[str] = None
    branch: Optional[str] = None
    academic_interests: Optional[List[str]] = None
    existing_skills: Optional[List[str]] = None
    preferred_careers: Optional[List[str]] = None
    target_job_role: Optional[str] = None
    available_hours_per_week: Optional[int] = Field(None, ge=1, le=80)
    preferred_learning_format: Optional[str] = None
    target_timeline_weeks: Optional[int] = Field(None, ge=4, le=52)
    onboarding_completed: Optional[bool] = None

class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    qualification: Optional[str] = None
    institution: Optional[str] = None
    current_semester: Optional[str] = None
    branch: Optional[str] = None
    academic_interests: List[str] = []
    existing_skills: List[str] = []
    preferred_careers: List[str] = []
    target_job_role: Optional[str] = None
    available_hours_per_week: int = 14
    preferred_learning_format: str = "interactive"
    target_timeline_weeks: int = 16
    onboarding_completed: bool = False
    roles: List[str] = []
    created_at: datetime

    @field_validator("roles", mode="before")
    @classmethod
    def convert_roles(cls, v):
        if isinstance(v, list):
            result = []
            for item in v:
                if isinstance(item, str):
                    result.append(item)
                elif hasattr(item, "role"):
                    result.append(item.role)
            return result
        return []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[str] = None

# ----------------- Skills & Gap Analysis -----------------
class SkillOut(BaseModel):
    id: str
    name: str
    category: str
    description: Optional[str] = None
    prerequisite_skill_ids: List[str] = []

    class Config:
        from_attributes = True

class SkillAssessmentOut(BaseModel):
    id: str
    skill_id: str
    skill_name: Optional[str] = None
    category: Optional[str] = None
    current_proficiency: float
    target_proficiency: float
    gap: float
    confidence_level: str
    evidence_count: int
    last_assessed_at: datetime

    class Config:
        from_attributes = True

class SkillGapReport(BaseModel):
    target_career_id: str
    target_career_title: str
    overall_match_percentage: float
    strong_skills: List[Dict[str, Any]]
    developing_skills: List[Dict[str, Any]]
    skills_needing_attention: List[Dict[str, Any]]
    unassessed_skills: List[Dict[str, Any]]
    recommended_priority_skills: List[Dict[str, Any]]
    total_estimated_study_hours: int

# ----------------- Careers -----------------
class CareerSummaryOut(BaseModel):
    id: str
    title: str
    overview: str
    entry_level_roles: List[str] = []
    technical_skills: List[str] = []

    class Config:
        from_attributes = True

class CareerProfileOut(BaseModel):
    id: str
    title: str
    overview: str
    responsibilities: List[str] = []
    foundational_skills: List[str] = []
    technical_skills: List[str] = []
    soft_skills: List[str] = []
    prerequisites: List[str] = []
    recommended_projects: List[str] = []
    suggested_certifications: List[str] = []
    entry_level_roles: List[str] = []
    learning_resources: List[Dict[str, Any]] = []
    roadmap_outline: List[Dict[str, Any]] = []
    proficiency_expectations: Dict[str, Any] = {}

    class Config:
        from_attributes = True

class CareerRecommendationRequest(BaseModel):
    academic_interests: Optional[List[str]] = None
    existing_skills: Optional[List[str]] = None
    preferred_careers: Optional[List[str]] = None
    target_timeline_weeks: Optional[int] = None
    available_hours_per_week: Optional[int] = None

class CareerMatchItem(BaseModel):
    career_id: str
    career_title: str
    estimated_match_score: int  # 0 to 100
    confidence_level: str  # low, medium, high
    explanation: str
    matching_skills: List[str]
    missing_skills: List[str]
    suggested_first_step: str

class CareerRecommendationResponse(BaseModel):
    recommended_careers: List[CareerMatchItem]
    top_recommendation: CareerMatchItem
    scoring_notes: str
    disclaimer: str

# ----------------- Assessments -----------------
class QuestionOption(BaseModel):
    id: str
    text: str

class AssessmentQuestionClient(BaseModel):
    id: str
    category: str
    difficulty: str
    question_text: str
    code_snippet: Optional[str] = None
    options: List[QuestionOption]
    relevant_skill_ids: List[str] = []

class AssessmentStartRequest(BaseModel):
    career_id: Optional[str] = "full-stack-developer"
    category: Optional[str] = None
    camera_monitoring_enabled: bool = False

class AssessmentAttemptOut(BaseModel):
    id: str
    title: str
    category: Optional[str] = None
    career_id: Optional[str] = None
    started_at: datetime
    expires_at: datetime
    time_limit_minutes: int
    camera_monitoring_enabled: bool
    status: str
    questions: List[AssessmentQuestionClient]

class AssessmentSubmitRequest(BaseModel):
    attempt_id: str
    answers: Dict[str, str]  # question_id -> selected_option_id
    time_spent_seconds: int = 0

class AnswerReviewItem(BaseModel):
    question_id: str
    question_text: str
    selected_option_id: Optional[str]
    correct_option_id: str
    is_correct: bool
    explanation: Optional[str]

class AssessmentResultOut(BaseModel):
    attempt_id: str
    title: str
    career_id: Optional[str]
    score_percentage: float
    passed: bool
    total_questions: int
    correct_answers_count: int
    category_scores: Dict[str, float]
    time_spent_seconds: int
    integrity_status: str
    review_items: List[AnswerReviewItem]
    next_recommended_action: str

# ----------------- Assessment Integrity -----------------
class IntegrityEventCreate(BaseModel):
    attempt_id: str
    event_type: str  # tab_switch, window_blur, fullscreen_exit, camera_permission_denied, camera_disconnected
    details: Dict[str, Any] = {}

class IntegrityReportOut(BaseModel):
    attempt_id: str
    camera_monitoring_enabled: bool
    total_events: int
    tab_switches: int
    window_blurs: int
    fullscreen_exits: int
    camera_disconnects: int
    integrity_status: str
    notes: str
    timeline: List[Dict[str, Any]]

# ----------------- Roadmaps -----------------
class RoadmapTaskOut(BaseModel):
    id: str
    stage_number: int
    stage_title: str
    title: str
    skill_category: str
    description: str
    learning_objectives: List[str] = []
    recommendation_reason: Optional[str] = None
    prerequisite_task_ids: List[str] = []
    estimated_hours: int
    resources: List[Dict[str, Any]] = []
    practical_exercises: List[str] = []
    deliverable: Optional[str] = None
    validation_quiz_id: Optional[str] = None
    status: str  # locked, available, in_progress, completed
    priority: str
    target_week: int
    completed_at: Optional[datetime] = None
    actual_hours_spent: float = 0.0
    evidence_notes: Optional[str] = None

    class Config:
        from_attributes = True

class RoadmapOut(BaseModel):
    id: str
    user_id: str
    career_id: str
    career_title: Optional[str] = None
    title: str
    total_stages: int
    estimated_weeks: int
    total_hours: int
    is_ai_generated: bool
    is_fallback: bool
    ai_model_used: Optional[str] = None
    adaptation_count: int
    overall_progress_percentage: float
    status: str
    tasks: List[RoadmapTaskOut]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RoadmapGenerateRequest(BaseModel):
    career_id: str = "full-stack-developer"
    force_regenerate: bool = False

class RoadmapTaskUpdateStatus(BaseModel):
    status: str  # in_progress, completed
    actual_hours_spent: Optional[float] = None
    evidence_notes: Optional[str] = None

class RoadmapAdaptRequest(BaseModel):
    career_id: Optional[str] = None
    new_available_hours_per_week: Optional[int] = None
    new_target_timeline_weeks: Optional[int] = None
    adaptation_reason: str = "Student updated preferences or assessment progress"

# ----------------- Learning Resources -----------------
class LearningResourceOut(BaseModel):
    id: str
    title: str
    provider: str
    skill_id: Optional[str] = None
    career_id: Optional[str] = None
    difficulty: str
    format: str
    estimated_hours: int
    is_free: bool
    url: str
    recommended_stage: int

    class Config:
        from_attributes = True

# ----------------- Projects -----------------
class ProjectOut(BaseModel):
    id: str
    title: str
    career_id: str
    level: str
    problem_statement: str
    required_skills: List[str] = []
    learning_objectives: List[str] = []
    suggested_features: List[str] = []
    implementation_milestones: List[str] = []
    rubric: List[Dict[str, Any]] = []
    submission_criteria: str

    class Config:
        from_attributes = True

class ProjectSubmissionCreate(BaseModel):
    project_id: str
    repository_url: str
    live_demo_url: Optional[str] = None
    submission_notes: Optional[str] = None

class ProjectSubmissionOut(BaseModel):
    id: str
    project_id: str
    project_title: Optional[str] = None
    user_id: str
    repository_url: str
    live_demo_url: Optional[str] = None
    submission_notes: Optional[str] = None
    status: str
    reviewer_feedback: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    submitted_at: datetime

    class Config:
        from_attributes = True

class ProjectReviewRequest(BaseModel):
    submission_id: str
    status: str  # approved, revision_requested
    reviewer_feedback: str

# ----------------- Certificates -----------------
class CertificateGenerateRequest(BaseModel):
    achievement_type: str  # diagnostic_distinction, skill_track, project_milestone, stage_completion, full_roadmap
    career_id: Optional[str] = None

class CertificateOut(BaseModel):
    id: str
    certificate_id: str
    student_name: str
    achievement_type: str
    title: str
    career_title: Optional[str] = None
    criteria_summary: str
    issued_at: datetime
    verification_hash: str
    verification_url: str
    is_revoked: bool
    pdf_download_url: str

class CertificateVerifyOut(BaseModel):
    certificate_id: str
    is_valid: bool
    student_name: str
    achievement_title: str
    career_title: Optional[str]
    issued_at: datetime
    criteria_summary: str
    platform_name: str = "AI Career & Smart Roadmap System"
    scope_disclaimer: str

# ----------------- Mentor Sharing -----------------
class MentorShareCreate(BaseModel):
    mentor_email: EmailStr
    can_review_roadmaps: bool = True
    can_approve_projects: bool = True
    can_view_assessments: bool = True

class MentorShareOut(BaseModel):
    id: str
    student_id: str
    student_name: Optional[str] = None
    mentor_email: str
    share_token: str
    status: str
    can_review_roadmaps: bool
    can_approve_projects: bool
    can_view_assessments: bool
    created_at: datetime

    class Config:
        from_attributes = True

class MentorFeedbackRequest(BaseModel):
    student_id: str
    task_id: Optional[str] = None
    feedback_notes: str

# ----------------- Weekly Planner -----------------
class WeeklyPlanDay(BaseModel):
    day_name: str
    allocated_hours: float
    tasks: List[RoadmapTaskOut]

class LogHoursRequest(BaseModel):
    task_id: str
    hours_spent: float = Field(..., ge=0.1, le=24.0)
    notes: Optional[str] = None

class WeeklyPlanOut(BaseModel):
    current_week: int
    weekly_target_hours: int
    scheduled_tasks_count: int
    completed_tasks_count: int
    days: List[WeeklyPlanDay]

# ----------------- Admin -----------------
class AdminStatsOut(BaseModel):
    total_students: int
    total_assessments_taken: int
    total_roadmaps_generated: int
    total_projects_submitted: int
    total_certificates_issued: int
    integrity_flagged_count: int
    popular_careers: List[Dict[str, Any]]
