import {
  User, CareerSummary, CareerProfile, CareerRecommendationResponse,
  AssessmentAttempt, AssessmentResult, SkillGapReport,
  Roadmap, WeeklyPlan, Project, ProjectSubmission, LearningResource,
  Certificate, CertificateVerify, IntegrityReport, AdminStats
} from '../types';

const API_BASE = '/api';

function getHeaders(isJson = true): HeadersInit {
  const headers: Record<string, string> = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'An error occurred';
    try {
      const err = await res.json();
      errorMsg = err.detail || err.message || JSON.stringify(err);
    } catch {
      errorMsg = res.statusText || String(res.status);
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async register(data: { email: string; password: string; full_name: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ access_token: string; user: User }>(res);
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ access_token: string; user: User }>(res);
  },

  async demoLogin() {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<{ access_token: string; user: User }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse<User>(res);
  },

  async updateProfile(data: Partial<User>) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<User>(res);
  },

  // Careers
  async getCareers() {
    const res = await fetch(`${API_BASE}/careers`, {
      headers: getHeaders(),
    });
    return handleResponse<CareerSummary[]>(res);
  },

  async getCareer(id: string) {
    const res = await fetch(`${API_BASE}/careers/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse<CareerProfile>(res);
  },

  async getRecommendations(data: {
    academic_interests?: string[];
    existing_skills?: string[];
    preferred_careers?: string[];
  }) {
    const res = await fetch(`${API_BASE}/careers/recommend`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<CareerRecommendationResponse>(res);
  },

  // Assessments
  async startAssessment(data: { career_id?: string; category?: string; camera_monitoring_enabled?: boolean }) {
    const res = await fetch(`${API_BASE}/assessments/start`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<AssessmentAttempt>(res);
  },

  async submitAssessment(data: { attempt_id: string; answers: Record<string, string>; time_spent_seconds: number }) {
    const res = await fetch(`${API_BASE}/assessments/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<AssessmentResult>(res);
  },

  async getAssessmentHistory() {
    const res = await fetch(`${API_BASE}/assessments/history`, {
      headers: getHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  // Skills
  async getGapReport(careerId?: string) {
    const url = careerId ? `${API_BASE}/skills/gap-report?career_id=${careerId}` : `${API_BASE}/skills/gap-report`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse<SkillGapReport>(res);
  },

  async getMySkillAssessments() {
    const res = await fetch(`${API_BASE}/skills/my-assessments`, {
      headers: getHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  // Roadmaps
  async getCurrentRoadmap(careerId?: string) {
    const url = careerId ? `${API_BASE}/roadmaps/current?career_id=${careerId}` : `${API_BASE}/roadmaps/current`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse<Roadmap>(res);
  },

  async generateRoadmap(careerId: string, force = false) {
    const res = await fetch(`${API_BASE}/roadmaps/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ career_id: careerId, force_regenerate: force }),
    });
    return handleResponse<Roadmap>(res);
  },

  async updateTaskStatus(taskId: string, status: string, actualHours = 0, notes?: string) {
    const res = await fetch(`${API_BASE}/roadmaps/tasks/${taskId}/status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status, actual_hours_spent: actualHours, evidence_notes: notes }),
    });
    return handleResponse<Roadmap>(res);
  },

  async adaptRoadmap(data: { career_id?: string; new_available_hours_per_week?: number; new_target_timeline_weeks?: number; adaptation_reason: string }) {
    const res = await fetch(`${API_BASE}/roadmaps/adapt`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Roadmap>(res);
  },

  // Planner
  async getWeeklyPlan() {
    const res = await fetch(`${API_BASE}/planner/weekly`, {
      headers: getHeaders(),
    });
    return handleResponse<WeeklyPlan>(res);
  },

  // Projects
  async getProjects(careerId?: string) {
    const url = careerId ? `${API_BASE}/projects?career_id=${careerId}` : `${API_BASE}/projects`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse<Project[]>(res);
  },

  async submitProject(data: { project_id: string; repository_url: string; live_demo_url?: string; submission_notes?: string }) {
    const res = await fetch(`${API_BASE}/projects/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<ProjectSubmission>(res);
  },

  async getMySubmissions() {
    const res = await fetch(`${API_BASE}/projects/my-submissions`, {
      headers: getHeaders(),
    });
    return handleResponse<ProjectSubmission[]>(res);
  },

  async reviewProject(submissionId: string, status: string, feedback: string) {
    const res = await fetch(`${API_BASE}/projects/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ submission_id: submissionId, status, reviewer_feedback: feedback }),
    });
    return handleResponse<ProjectSubmission>(res);
  },

  // Resources
  async getResources(params?: { skill_id?: string; career_id?: string; difficulty?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const url = query ? `${API_BASE}/resources?${query}` : `${API_BASE}/resources`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse<LearningResource[]>(res);
  },

  // Integrity
  async logIntegrityEvent(data: { attempt_id: string; event_type: string; details?: any }) {
    const res = await fetch(`${API_BASE}/integrity/event`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ status: string; attempt_status: string }>(res);
  },

  async getIntegrityReport(attemptId: string) {
    const res = await fetch(`${API_BASE}/integrity/report/${attemptId}`, {
      headers: getHeaders(),
    });
    return handleResponse<IntegrityReport>(res);
  },

  // Certificates
  async claimCertificate(achievementType: string, careerId?: string) {
    const res = await fetch(`${API_BASE}/certificates/claim`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ achievement_type: achievementType, career_id: careerId }),
    });
    return handleResponse<Certificate>(res);
  },

  async getMyCertificates() {
    const res = await fetch(`${API_BASE}/certificates/my`, {
      headers: getHeaders(),
    });
    return handleResponse<Certificate[]>(res);
  },

  async verifyCertificate(certificateId: string) {
    const res = await fetch(`${API_BASE}/certificates/verify/${certificateId}`);
    return handleResponse<CertificateVerify>(res);
  },

  // Mentors
  async shareWithMentor(email: string) {
    const res = await fetch(`${API_BASE}/mentors/share`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ mentor_email: email }),
    });
    return handleResponse<any>(res);
  },

  async getMyShares() {
    const res = await fetch(`${API_BASE}/mentors/my-shares`, {
      headers: getHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  async getMentorStudents() {
    const res = await fetch(`${API_BASE}/mentors/my-students`, {
      headers: getHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  // Admin
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getHeaders(),
    });
    return handleResponse<AdminStats>(res);
  },

  async getFlaggedAssessments() {
    const res = await fetch(`${API_BASE}/admin/integrity-flags`, {
      headers: getHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  async markIntegrityReviewed(attemptId: string, action: 'reviewed' | 'clean') {
    const res = await fetch(`${API_BASE}/admin/integrity-review/${attemptId}?action=${action}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },
};
