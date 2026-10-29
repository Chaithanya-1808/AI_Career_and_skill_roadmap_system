import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    avatar_url = Column(String(512), nullable=True)
    qualification = Column(String(255), nullable=True)
    institution = Column(String(255), nullable=True)
    current_semester = Column(String(64), nullable=True)
    branch = Column(String(255), nullable=True)
    academic_interests = Column(JSON, default=list)
    existing_skills = Column(JSON, default=list)
    preferred_careers = Column(JSON, default=list)
    target_job_role = Column(String(255), nullable=True)
    available_hours_per_week = Column(Integer, default=14)
    preferred_learning_format = Column(String(64), default="interactive")
    target_timeline_weeks = Column(Integer, default=16)
    onboarding_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    roles = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")
    attempts = relationship("AssessmentAttempt", back_populates="user", cascade="all, delete-orphan")
    skill_assessments = relationship("SkillAssessment", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")
    project_submissions = relationship("ProjectSubmission", back_populates="user", cascade="all, delete-orphan", foreign_keys="[ProjectSubmission.user_id]")
    certificates = relationship("Certificate", back_populates="user", cascade="all, delete-orphan")

class UserRole(Base):
    __tablename__ = "user_roles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(32), nullable=False)  # student, admin, mentor
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="roles")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(String(64), primary_key=True)  # e.g. "html-css", "javascript", "react"
    name = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False)
    description = Column(Text, nullable=True)
    prerequisite_skill_ids = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class CareerProfile(Base):
    __tablename__ = "career_profiles"

    id = Column(String(64), primary_key=True)  # e.g. "full-stack-developer"
    title = Column(String(128), nullable=False)
    overview = Column(Text, nullable=False)
    responsibilities = Column(JSON, default=list)
    foundational_skills = Column(JSON, default=list)
    technical_skills = Column(JSON, default=list)
    soft_skills = Column(JSON, default=list)
    prerequisites = Column(JSON, default=list)
    recommended_projects = Column(JSON, default=list)
    suggested_certifications = Column(JSON, default=list)
    entry_level_roles = Column(JSON, default=list)
    learning_resources = Column(JSON, default=list)
    roadmap_outline = Column(JSON, default=list)
    proficiency_expectations = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    skill_requirements = relationship("CareerSkillRequirement", back_populates="career", cascade="all, delete-orphan")

class CareerSkillRequirement(Base):
    __tablename__ = "career_skill_requirements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    career_id = Column(String(64), ForeignKey("career_profiles.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(String(64), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    target_proficiency = Column(Integer, nullable=False)  # 1 to 5
    importance = Column(String(32), nullable=False)  # critical, high, medium, optional
    learning_effort_hours = Column(Integer, default=20)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    career = relationship("CareerProfile", back_populates="skill_requirements")
    skill = relationship("Skill")

class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    category = Column(String(64), nullable=False, index=True)
    difficulty = Column(String(32), nullable=False)  # beginner, intermediate, advanced
    question_text = Column(Text, nullable=False)
    code_snippet = Column(Text, nullable=True)
    options = Column(JSON, nullable=False)  # list of {"id": "A", "text": "..."}
    correct_option_id = Column(String(16), nullable=False)  # PROTECTED SERVER-SIDE
    explanation = Column(Text, nullable=True)
    relevant_skill_ids = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    career_id = Column(String(64), ForeignKey("career_profiles.id"), nullable=True)
    title = Column(String(255), nullable=False)
    category = Column(String(64), nullable=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)
    submitted_at = Column(DateTime, nullable=True)
    status = Column(String(32), default="in_progress")  # in_progress, submitted, expired, abandoned
    score_percentage = Column(Float, nullable=True)
    category_scores = Column(JSON, default=dict)
    time_spent_seconds = Column(Integer, default=0)
    camera_monitoring_enabled = Column(Boolean, default=False)
    integrity_status = Column(String(32), default="clean")  # clean, flagged, reviewed
    integrity_summary = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="attempts")
    answers = relationship("AssessmentAnswer", back_populates="attempt", cascade="all, delete-orphan")
    integrity_events = relationship("AssessmentIntegrityEvent", back_populates="attempt", cascade="all, delete-orphan")

class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    attempt_id = Column(String(36), ForeignKey("assessment_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("assessment_questions.id", ondelete="CASCADE"), nullable=False)
    selected_option_id = Column(String(16), nullable=True)
    is_correct = Column(Boolean, default=False)
    answered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    attempt = relationship("AssessmentAttempt", back_populates="answers")
    question = relationship("AssessmentQuestion")

class SkillAssessment(Base):
    __tablename__ = "skill_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(64), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    current_proficiency = Column(Float, default=1.0)
    target_proficiency = Column(Float, default=4.0)
    evidence_count = Column(Integer, default=1)
    confidence_level = Column(String(32), default="medium")  # low, medium, high
    last_assessed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="skill_assessments")
    skill = relationship("Skill")

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    career_id = Column(String(64), ForeignKey("career_profiles.id"), nullable=False)
    title = Column(String(255), nullable=False)
    total_stages = Column(Integer, default=5)
    estimated_weeks = Column(Integer, default=16)
    total_hours = Column(Integer, default=224)
    is_ai_generated = Column(Boolean, default=False)
    is_fallback = Column(Boolean, default=False)
    ai_model_used = Column(String(64), nullable=True)
    adaptation_count = Column(Integer, default=0)
    overall_progress_percentage = Column(Float, default=0.0)
    status = Column(String(32), default="active")  # active, completed, archived
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="roadmaps")
    tasks = relationship("RoadmapTask", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapTask.stage_number")
    versions = relationship("RoadmapVersion", back_populates="roadmap", cascade="all, delete-orphan")

class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"

    id = Column(String(64), primary_key=True)  # e.g. "TASK-1-1"
    roadmap_id = Column(String(36), ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False, index=True)
    stage_number = Column(Integer, nullable=False)
    stage_title = Column(String(128), nullable=False)
    title = Column(String(255), nullable=False)
    skill_category = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    learning_objectives = Column(JSON, default=list)
    recommendation_reason = Column(Text, nullable=True)
    prerequisite_task_ids = Column(JSON, default=list)
    estimated_hours = Column(Integer, default=5)
    resources = Column(JSON, default=list)
    practical_exercises = Column(JSON, default=list)
    deliverable = Column(Text, nullable=True)
    validation_quiz_id = Column(String(64), nullable=True)
    status = Column(String(32), default="locked")  # locked, available, in_progress, completed
    priority = Column(String(32), default="high")  # critical, high, medium, optional
    target_week = Column(Integer, default=1)
    completed_at = Column(DateTime, nullable=True)
    actual_hours_spent = Column(Float, default=0.0)
    evidence_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    roadmap = relationship("Roadmap", back_populates="tasks")

class RoadmapVersion(Base):
    __tablename__ = "roadmap_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    roadmap_id = Column(String(36), ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    change_reason = Column(Text, nullable=False)
    snapshot = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    roadmap = relationship("Roadmap", back_populates="versions")

class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    provider = Column(String(128), nullable=False)
    skill_id = Column(String(64), ForeignKey("skills.id"), nullable=True)
    career_id = Column(String(64), ForeignKey("career_profiles.id"), nullable=True)
    difficulty = Column(String(32), nullable=False)  # beginner, intermediate, advanced
    format = Column(String(32), nullable=False)  # article, interactive, video, documentation, course
    estimated_hours = Column(Integer, default=5)
    is_free = Column(Boolean, default=True)
    url = Column(String(512), nullable=False)
    recommended_stage = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(64), primary_key=True)  # e.g. "fsd-proj-portfolio"
    title = Column(String(255), nullable=False)
    career_id = Column(String(64), ForeignKey("career_profiles.id"), nullable=False)
    level = Column(String(32), nullable=False)  # beginner, intermediate, advanced, capstone
    problem_statement = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)
    learning_objectives = Column(JSON, default=list)
    suggested_features = Column(JSON, default=list)
    implementation_milestones = Column(JSON, default=list)
    rubric = Column(JSON, default=list)
    submission_criteria = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ProjectSubmission(Base):
    __tablename__ = "project_submissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(64), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    repository_url = Column(String(512), nullable=False)
    live_demo_url = Column(String(512), nullable=True)
    submission_notes = Column(Text, nullable=True)
    status = Column(String(32), default="pending")  # pending, approved, revision_requested
    reviewer_feedback = Column(Text, nullable=True)
    reviewed_by = Column(String(36), ForeignKey("profiles.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="project_submissions", foreign_keys=[user_id])
    project = relationship("Project")

class AssessmentIntegrityEvent(Base):
    __tablename__ = "assessment_integrity_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    attempt_id = Column(String(36), ForeignKey("assessment_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(64), nullable=False)  # tab_switch, window_blur, fullscreen_exit, camera_permission_denied, camera_disconnected, suspicious_timing
    event_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    details = Column(JSON, default=dict)

    attempt = relationship("AssessmentAttempt", back_populates="integrity_events")

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    certificate_id = Column(String(64), unique=True, nullable=False, index=True)  # e.g. "ACR-2026-FSD-9842"
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    student_name = Column(String(255), nullable=False)
    achievement_type = Column(String(64), nullable=False)  # diagnostic_distinction, skill_track, project_milestone, stage_completion, full_roadmap
    title = Column(String(255), nullable=False)
    career_title = Column(String(128), nullable=True)
    criteria_summary = Column(Text, nullable=False)
    issued_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    verification_hash = Column(String(128), nullable=False)
    is_revoked = Column(Boolean, default=False)
    pdf_filename = Column(String(255), nullable=True)

    user = relationship("User", back_populates="certificates")

class MentorShare(Base):
    __tablename__ = "mentor_shares"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    mentor_id = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    mentor_email = Column(String(255), nullable=False, index=True)
    share_token = Column(String(64), unique=True, nullable=False)
    can_review_roadmaps = Column(Boolean, default=True)
    can_approve_projects = Column(Boolean, default=True)
    can_view_assessments = Column(Boolean, default=True)
    status = Column(String(32), default="active")  # active, revoked
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor_id = Column(String(36), ForeignKey("profiles.id"), nullable=True)
    actor_email = Column(String(255), nullable=False)
    action = Column(String(128), nullable=False)
    target_type = Column(String(64), nullable=False)
    target_id = Column(String(64), nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
