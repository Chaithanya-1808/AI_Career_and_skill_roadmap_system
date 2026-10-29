-- ====================================================================
-- AI Career & Smart Roadmap System - Supabase PostgreSQL Schema
-- Migration: 20261029000001_initial_schema.sql
-- ====================================================================

-- 1. User Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    qualification TEXT,
    institution TEXT,
    current_semester TEXT,
    branch TEXT,
    academic_interests JSONB DEFAULT '[]'::jsonb,
    existing_skills JSONB DEFAULT '[]'::jsonb,
    preferred_careers JSONB DEFAULT '[]'::jsonb,
    target_job_role TEXT,
    available_hours_per_week INTEGER DEFAULT 14,
    preferred_learning_format TEXT DEFAULT 'interactive',
    target_timeline_weeks INTEGER DEFAULT 16,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Roles (Separation of concerns, no client manipulation)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'mentor')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 3. Skills Catalog
CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY, -- e.g. 'html-css', 'javascript', 'react', 'sql'
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    prerequisite_skill_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Career Profiles (12 standard profiles)
CREATE TABLE IF NOT EXISTS career_profiles (
    id TEXT PRIMARY KEY, -- e.g. 'full-stack-developer', 'data-scientist'
    title TEXT NOT NULL,
    overview TEXT NOT NULL,
    responsibilities JSONB DEFAULT '[]'::jsonb,
    foundational_skills JSONB DEFAULT '[]'::jsonb,
    technical_skills JSONB DEFAULT '[]'::jsonb,
    soft_skills JSONB DEFAULT '[]'::jsonb,
    prerequisites JSONB DEFAULT '[]'::jsonb,
    recommended_projects JSONB DEFAULT '[]'::jsonb,
    suggested_certifications JSONB DEFAULT '[]'::jsonb,
    entry_level_roles JSONB DEFAULT '[]'::jsonb,
    learning_resources JSONB DEFAULT '[]'::jsonb,
    roadmap_outline JSONB DEFAULT '[]'::jsonb,
    proficiency_expectations JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Career Skill Requirements
CREATE TABLE IF NOT EXISTS career_skill_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_id TEXT NOT NULL REFERENCES career_profiles(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    target_proficiency INTEGER NOT NULL CHECK (target_proficiency BETWEEN 1 AND 5),
    importance TEXT NOT NULL CHECK (importance IN ('critical', 'high', 'medium', 'optional')),
    learning_effort_hours INTEGER DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(career_id, skill_id)
);

-- 6. Question Bank (Correct answers never served to client during test)
CREATE TABLE IF NOT EXISTS assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    question_text TEXT NOT NULL,
    code_snippet TEXT,
    options JSONB NOT NULL, -- Array of { "id": "A", "text": "..." }
    correct_option_id TEXT NOT NULL, -- Server only!
    explanation TEXT,
    relevant_skill_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Assessment Attempts
CREATE TABLE IF NOT EXISTS assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    career_id TEXT REFERENCES career_profiles(id),
    title TEXT NOT NULL,
    category TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    submitted_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'expired', 'abandoned')),
    score_percentage NUMERIC(5,2),
    category_scores JSONB DEFAULT '{}'::jsonb,
    time_spent_seconds INTEGER DEFAULT 0,
    camera_monitoring_enabled BOOLEAN DEFAULT FALSE,
    integrity_status TEXT DEFAULT 'clean' CHECK (integrity_status IN ('clean', 'flagged', 'reviewed')),
    integrity_summary JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Assessment Answers
CREATE TABLE IF NOT EXISTS assessment_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
    selected_option_id TEXT,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(attempt_id, question_id)
);

-- 9. Skill Assessment State (Student skill mastery evidence)
CREATE TABLE IF NOT EXISTS skill_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    current_proficiency NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (current_proficiency BETWEEN 0.0 AND 5.0),
    target_proficiency NUMERIC(3,2) NOT NULL DEFAULT 4.0 CHECK (target_proficiency BETWEEN 1.0 AND 5.0),
    evidence_count INTEGER DEFAULT 1,
    confidence_level TEXT DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),
    last_assessed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- 10. Roadmaps
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    career_id TEXT NOT NULL REFERENCES career_profiles(id),
    title TEXT NOT NULL,
    total_stages INTEGER NOT NULL DEFAULT 5,
    estimated_weeks INTEGER NOT NULL DEFAULT 16,
    total_hours INTEGER NOT NULL DEFAULT 224,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    is_fallback BOOLEAN DEFAULT FALSE,
    ai_model_used TEXT,
    adaptation_count INTEGER DEFAULT 0,
    overall_progress_percentage NUMERIC(5,2) DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Roadmap Tasks
CREATE TABLE IF NOT EXISTS roadmap_tasks (
    id TEXT PRIMARY KEY, -- e.g. 'TASK-1-1'
    roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
    stage_number INTEGER NOT NULL,
    stage_title TEXT NOT NULL,
    title TEXT NOT NULL,
    skill_category TEXT NOT NULL,
    description TEXT NOT NULL,
    learning_objectives JSONB DEFAULT '[]'::jsonb,
    recommendation_reason TEXT,
    prerequisite_task_ids JSONB DEFAULT '[]'::jsonb,
    estimated_hours INTEGER NOT NULL DEFAULT 5,
    resources JSONB DEFAULT '[]'::jsonb,
    practical_exercises JSONB DEFAULT '[]'::jsonb,
    deliverable TEXT,
    validation_quiz_id TEXT,
    status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
    priority TEXT NOT NULL DEFAULT 'high' CHECK (priority IN ('critical', 'high', 'medium', 'optional')),
    target_week INTEGER DEFAULT 1,
    completed_at TIMESTAMPTZ,
    actual_hours_spent NUMERIC(4,1) DEFAULT 0.0,
    evidence_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Roadmap Versions (For audit & adaptive history)
CREATE TABLE IF NOT EXISTS roadmap_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    change_reason TEXT NOT NULL,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Curated Learning Resources
CREATE TABLE IF NOT EXISTS learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    skill_id TEXT REFERENCES skills(id),
    career_id TEXT REFERENCES career_profiles(id),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    format TEXT NOT NULL CHECK (format IN ('article', 'interactive', 'video', 'documentation', 'course')),
    estimated_hours INTEGER DEFAULT 5,
    is_free BOOLEAN DEFAULT TRUE,
    url TEXT NOT NULL,
    recommended_stage INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Projects Catalog
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    career_id TEXT NOT NULL REFERENCES career_profiles(id),
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'capstone')),
    problem_statement TEXT NOT NULL,
    required_skills JSONB DEFAULT '[]'::jsonb,
    learning_objectives JSONB DEFAULT '[]'::jsonb,
    suggested_features JSONB DEFAULT '[]'::jsonb,
    implementation_milestones JSONB DEFAULT '[]'::jsonb,
    rubric JSONB DEFAULT '[]'::jsonb,
    submission_criteria TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Project Submissions
CREATE TABLE IF NOT EXISTS project_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    repository_url TEXT NOT NULL,
    live_demo_url TEXT,
    submission_notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'revision_requested')),
    reviewer_feedback TEXT,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Assessment Integrity Events
CREATE TABLE IF NOT EXISTS assessment_integrity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('tab_switch', 'window_blur', 'fullscreen_exit', 'camera_permission_denied', 'camera_disconnected', 'suspicious_timing')),
    event_timestamp TIMESTAMPTZ DEFAULT NOW(),
    details JSONB DEFAULT '{}'::jsonb
);

-- 17. Certificates & Public Verification
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id TEXT NOT NULL UNIQUE, -- Human-friendly & secure identifier e.g. 'ACR-2026-FSD-7894'
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    achievement_type TEXT NOT NULL CHECK (achievement_type IN ('diagnostic_distinction', 'skill_track', 'project_milestone', 'stage_completion', 'full_roadmap')),
    title TEXT NOT NULL,
    career_title TEXT,
    criteria_summary TEXT NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    verification_hash TEXT NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    pdf_filename TEXT
);

-- 18. Mentor Sharing Permissions
CREATE TABLE IF NOT EXISTS mentor_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    mentor_email TEXT NOT NULL,
    share_token TEXT NOT NULL UNIQUE,
    can_review_roadmaps BOOLEAN DEFAULT TRUE,
    can_approve_projects BOOLEAN DEFAULT TRUE,
    can_view_assessments BOOLEAN DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Administrative Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

