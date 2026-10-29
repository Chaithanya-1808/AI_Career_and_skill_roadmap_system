export type Role = 'student' | 'admin' | 'mentor';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  qualification?: string;
  institution?: string;
  current_semester?: string;
  branch?: string;
  academic_interests: string[];
  existing_skills: string[];
  preferred_careers: string[];
  target_job_role?: string;
  available_hours_per_week: number;
  preferred_learning_format: string;
  target_timeline_weeks: number;
  onboarding_completed: boolean;
  roles: Role[];
  created_at: string;
}

export interface CareerSummary {
  id: string;
  title: string;
  overview: string;
  entry_level_roles: string[];
  technical_skills: string[];
}

export interface CareerProfile extends CareerSummary {
  responsibilities: string[];
  foundational_skills: string[];
  soft_skills: string[];
  prerequisites: string[];
  recommended_projects: string[];
  suggested_certifications: string[];
  learning_resources: { title: string; url: string }[];
  roadmap_outline: { stage: number; title: string; weeks: string }[];
  proficiency_expectations: Record<string, number>;
}

export interface CareerMatchItem {
  career_id: string;
  career_title: string;
  estimated_match_score: number;
  confidence_level: string;
  explanation: string;
  matching_skills: string[];
  missing_skills: string[];
  suggested_first_step: string;
}

export interface CareerRecommendationResponse {
  recommended_careers: CareerMatchItem[];
  top_recommendation: CareerMatchItem;
  scoring_notes: string;
  disclaimer: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface AssessmentQuestion {
  id: string;
  category: string;
  difficulty: string;
  question_text: string;
  code_snippet?: string;
  options: QuestionOption[];
  relevant_skill_ids: string[];
}

export interface AssessmentAttempt {
  id: string;
  title: string;
  category?: string;
  career_id?: string;
  started_at: string;
  expires_at: string;
  time_limit_minutes: number;
  camera_monitoring_enabled: boolean;
  status: 'in_progress' | 'submitted' | 'expired' | 'abandoned';
  questions: AssessmentQuestion[];
}

export interface AnswerReviewItem {
  question_id: string;
  question_text: string;
  selected_option_id?: string;
  correct_option_id: string;
  is_correct: boolean;
  explanation?: string;
}

export interface AssessmentResult {
  attempt_id: string;
  title: string;
  career_id?: string;
  score_percentage: number;
  passed: boolean;
  total_questions: number;
  correct_answers_count: number;
  category_scores: Record<string, number>;
  time_spent_seconds: number;
  integrity_status: string;
  review_items: AnswerReviewItem[];
  next_recommended_action: string;
}

export interface SkillGapItem {
  skill_id: string;
  skill_name: string;
  current_proficiency: number;
  target_proficiency: number;
  gap: number;
  confidence: string;
  estimated_study_hours: number;
}

export interface SkillGapReport {
  target_career_id: string;
  target_career_title: string;
  overall_match_percentage: number;
  strong_skills: SkillGapItem[];
  developing_skills: SkillGapItem[];
  skills_needing_attention: SkillGapItem[];
  unassessed_skills: SkillGapItem[];
  recommended_priority_skills: SkillGapItem[];
  total_estimated_study_hours: number;
}

export interface RoadmapTask {
  id: string;
  stage_number: number;
  stage_title: string;
  title: string;
  skill_category: string;
  description: string;
  learning_objectives: string[];
  recommendation_reason?: string;
  prerequisite_task_ids: string[];
  estimated_hours: number;
  resources: { title: string; url: string }[];
  practical_exercises: string[];
  deliverable?: string;
  validation_quiz_id?: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  priority: 'critical' | 'high' | 'medium' | 'optional';
  target_week: number;
  completed_at?: string;
  actual_hours_spent: number;
  evidence_notes?: string;
}

export interface Roadmap {
  id: string;
  user_id: string;
  career_id: string;
  career_title?: string;
  title: string;
  total_stages: number;
  estimated_weeks: number;
  total_hours: number;
  is_ai_generated: boolean;
  is_fallback: boolean;
  ai_model_used?: string;
  adaptation_count: number;
  overall_progress_percentage: number;
  status: 'active' | 'completed' | 'archived';
  tasks: RoadmapTask[];
  created_at: string;
  updated_at: string;
}

export interface WeeklyPlanDay {
  day_name: string;
  allocated_hours: number;
  tasks: RoadmapTask[];
}

export interface WeeklyPlan {
  current_week: number;
  weekly_target_hours: number;
  scheduled_tasks_count: number;
  completed_tasks_count: number;
  days: WeeklyPlanDay[];
}

export interface Project {
  id: string;
  title: string;
  career_id: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'capstone';
  problem_statement: string;
  required_skills: string[];
  learning_objectives: string[];
  suggested_features: string[];
  implementation_milestones: string[];
  rubric: { criterion: string; points: number }[];
  submission_criteria: string;
}

export interface ProjectSubmission {
  id: string;
  project_id: string;
  project_title?: string;
  user_id: string;
  repository_url: string;
  live_demo_url?: string;
  submission_notes?: string;
  status: 'pending' | 'approved' | 'revision_requested';
  reviewer_feedback?: string;
  reviewed_at?: string;
  submitted_at: string;
}

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  skill_id?: string;
  career_id?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  format: 'article' | 'interactive' | 'video' | 'documentation' | 'course';
  estimated_hours: number;
  is_free: boolean;
  url: string;
  recommended_stage: number;
}

export interface Certificate {
  id: string;
  certificate_id: string;
  student_name: string;
  achievement_type: string;
  title: string;
  career_title?: string;
  criteria_summary: string;
  issued_at: string;
  verification_hash: string;
  verification_url: string;
  is_revoked: boolean;
  pdf_download_url: string;
}

export interface CertificateVerify {
  certificate_id: string;
  is_valid: boolean;
  student_name: string;
  achievement_title: string;
  career_title?: string;
  issued_at: string;
  criteria_summary: string;
  platform_name: string;
  scope_disclaimer: string;
}

export interface IntegrityReport {
  attempt_id: string;
  camera_monitoring_enabled: boolean;
  total_events: number;
  tab_switches: number;
  window_blurs: number;
  fullscreen_exits: number;
  camera_disconnects: number;
  integrity_status: string;
  notes: string;
  timeline: { id: string; event_type: string; timestamp: string; details: any }[];
}

export interface AdminStats {
  total_students: number;
  total_assessments_taken: number;
  total_roadmaps_generated: number;
  total_projects_submitted: number;
  total_certificates_issued: number;
  integrity_flagged_count: number;
  popular_careers: { career_id: string; count: number }[];
}
