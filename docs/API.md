# REST API Reference Documentation
## AI Career & Smart Roadmap System

All API endpoints are prefixed with `/api`. Protected routes require a Bearer token in the `Authorization` header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication & Profile (`/api/auth`)

### Register User
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "email": "student@college.edu",
  "password": "secure_password_123",
  "full_name": "Student Name"
}
```
- **Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "student@college.edu",
    "full_name": "Student Name",
    "roles": ["student"]
  }
}
```

### Login User
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "student@college.edu",
  "password": "secure_password_123"
}
```

### Get Current User Profile
- **GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` returning full student profile including academic semester, target job role, weekly available study hours, and assigned roles.

### Update Student Profile
- **PUT** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "full_name": "Chaithanya",
  "qualification": "B.Tech Computer Science & Engineering (CSE)",
  "institution": "Government Engineering College",
  "current_semester": 6,
  "branch": "Computer Science & Engineering",
  "academic_interests": ["Web Development", "AI Systems", "Software Engineering"],
  "existing_skills": ["C", "HTML5", "Python"],
  "target_job_role": "Full-Stack Developer",
  "available_hours_per_week": 14,
  "preferred_learning_format": "interactive",
  "target_timeline_weeks": 16
}
```

---

## 2. Career Explorer (`/api/careers`)

### List Careers
- **GET** `/api/careers`
- **Query Params:** `category`, `search`
- **Response:** Array of career summaries with titles, descriptions, categories, demand level, and required skill counts.

### Get Career Profile by ID or Slug
- **GET** `/api/careers/{career_id_or_slug}`
- **Response:** Detailed career profile with responsibilities, prerequisites, required skills, entry salary ranges, and suggested projects.

### Get Career Recommendations
- **GET** `/api/careers/recommendations/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "top_career": { "id": "...", "title": "Full-Stack Developer" },
  "match_score": 76.5,
  "explanation": "High alignment between your web development interests and current HTML5 skills.",
  "strengths": ["HTML5", "C programming foundation"],
  "key_gaps": ["React", "FastAPI", "SQL", "Docker"],
  "all_scores": [
    { "career_id": "...", "title": "Full-Stack Developer", "match_score": 76.5 },
    { "career_id": "...", "title": "Software Developer", "match_score": 72.0 }
  ]
}
```

---

## 3. Assessments & Anti-Cheat (`/api/assessments`)

### Start Diagnostic or Career Assessment
- **POST** `/api/assessments/start`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "assessment_type": "diagnostic",
  "career_id": "full-stack-developer",
  "camera_monitoring_enabled": true
}
```
- **Response:**
```json
{
  "attempt_id": "uuid",
  "assessment_type": "diagnostic",
  "title": "Comprehensive Full-Stack Diagnostic Assessment",
  "duration_minutes": 25,
  "camera_monitoring_enabled": true,
  "status": "in_progress",
  "questions": [
    {
      "id": "q1",
      "question_text": "What is the primary difference between synchronous and asynchronous execution in Node.js?",
      "options": [
        { "id": "opt_a", "text": "Sync blocks execution; async operates with event loop callbacks" },
        { "id": "opt_b", "text": "Sync uses multi-threading; async uses single threading only" }
      ],
      "difficulty": "medium",
      "category": "Backend Engineering"
    }
  ]
}
```
*(Notice: Correct answers and explanations are completely hidden from the response)*

### Submit Assessment
- **POST** `/api/assessments/submit`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "attempt_id": "uuid",
  "answers": [
    { "question_id": "q1", "selected_option_id": "opt_a" }
  ]
}
```
- **Response:**
```json
{
  "attempt_id": "uuid",
  "title": "Comprehensive Full-Stack Diagnostic Assessment",
  "score_percentage": 75.0,
  "passed": true,
  "total_questions": 8,
  "correct_answers_count": 6,
  "category_scores": {
    "Frontend Engineering": 80.0,
    "Backend Engineering": 70.0
  },
  "integrity_status": "clean",
  "review_items": [
    {
      "question_id": "q1",
      "question_text": "...",
      "selected_option_id": "opt_a",
      "correct_option_id": "opt_a",
      "is_correct": true,
      "explanation": "Node.js utilizes an event loop for non-blocking asynchronous operations."
    }
  ]
}
```

---

## 4. Skill Gap Analysis (`/api/skills`)

### Get Skill Gap Report
- **GET** `/api/skills/gap-report/{career_id}`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "career_id": "full-stack-developer",
  "career_title": "Full-Stack Developer",
  "overall_readiness_score": 45.0,
  "summary": "You have a solid foundation in basic frontend concepts, but need to build depth in modern frameworks (React) and backend API design.",
  "skills": [
    {
      "skill_id": "html5",
      "skill_name": "HTML5 & Semantic Web",
      "category": "Frontend",
      "current_level": 3,
      "target_level": 4,
      "gap": 1,
      "importance": "essential",
      "status": "in_progress"
    },
    {
      "skill_id": "react",
      "skill_name": "React.js & State Management",
      "category": "Frontend",
      "current_level": 0,
      "target_level": 4,
      "gap": 4,
      "importance": "essential",
      "status": "critical_gap"
    }
  ]
}
```

---

## 5. Roadmaps & Planner (`/api/roadmaps` & `/api/planner`)

### Generate or Get Active Roadmap
- **POST** `/api/roadmaps/generate`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "career_id": "full-stack-developer",
  "weekly_hours": 14,
  "target_weeks": 16,
  "focus_areas": ["React", "FastAPI", "Full-Stack Project"]
}
```
- **Response:** Returns complete roadmap with stages, milestone dates, and ordered tasks with dependencies.

### Update Task Status
- **PATCH** `/api/roadmaps/tasks/{task_id}/status`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "status": "completed"
}
```
- **Response:** Updates task and automatically unlocks eligible downstream tasks whose prerequisites are now fulfilled.

### Adapt Roadmap
- **POST** `/api/roadmaps/{roadmap_id}/adapt`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "reason": "Midterm exams requiring lighter study pace (10h/week)",
  "new_weekly_hours": 10
}
```

### Get Weekly Plan
- **GET** `/api/planner/weekly`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Returns schedule with daily hour targets (Mon-Sun), allocated tasks, and completed hours.

### Log Study Hours
- **POST** `/api/planner/log-hours`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "task_id": "task_uuid",
  "hours_spent": 2.5,
  "notes": "Completed React component state lifecycle tutorial"
}
```

---

## 6. Projects & Mentorship (`/api/projects` & `/api/mentors`)

### List Career Projects
- **GET** `/api/projects?career_id=full-stack-developer`
- **Response:** List of projects with descriptions, rubrics, and prerequisites.

### Submit Project
- **POST** `/api/projects/submit`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "project_id": "proj_uuid",
  "repository_url": "https://github.com/chaithanya-dev/fullstack-ecommerce-capstone",
  "live_demo_url": "https://chaithanya-ecommerce-demo.vercel.app",
  "submission_notes": "Implemented JWT auth, cart checkout, and responsive Tailwind UI."
}
```

### Review Project (Faculty/Mentor)
- **POST** `/api/projects/review`
- **Headers:** `Authorization: Bearer <mentor_token>`
- **Body:**
```json
{
  "submission_id": "sub_uuid",
  "status": "approved",
  "reviewer_feedback": "Excellent architectural separation and clean documentation."
}
```

### Share Portfolio with Mentor
- **POST** `/api/mentors/share`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "mentor_email": "prof.sharma@college.edu",
  "can_review_roadmaps": true,
  "can_approve_projects": true,
  "can_view_assessments": true
}
```

---

## 7. Certificates (`/api/certificates`)

### Claim Certificate
- **POST** `/api/certificates/claim`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "achievement_type": "career_track_completion",
  "career_id": "full-stack-developer"
}
```
- **Response:** Returns certificate record with unique ID `ACR-2026-FSD-XXXX`.

### Download Certificate PDF
- **GET** `/api/certificates/{certificate_id}/download`
- **Response:** `application/pdf` binary stream with embedded QR code.

### Public Certificate Verification
- **GET** `/api/certificates/verify/{certificate_id}`
- **Authentication:** None (Public Endpoint)
- **Response:**
```json
{
  "valid": true,
  "certificate_id": "ACR-2026-FSD-3B8A1",
  "student_name": "Chaithanya",
  "title": "Full-Stack Developer Track Completion",
  "issue_date": "2026-10-29T19:30:00Z",
  "criteria_met": [
    "Completed >= 80% roadmap milestones",
    "Passed Diagnostic Assessment with >= 70% score",
    "Completed verified practical capstone project"
  ]
}
```

---

## 8. Administration (`/api/admin`)

*Restricted to users with role `admin`.*

- **GET** `/api/admin/stats`: Aggregated platform metrics (students count, roadmaps created, assessments taken, certificates issued).
- **GET** `/api/admin/integrity-flags`: List of flagged assessment attempts.
- **POST** `/api/admin/integrity-review/{attempt_id}?action=reviewed`: Clear or affirm flagged assessment attempt.
- **POST** `/api/admin/careers`: Create or update career profiles and skill requirements.

