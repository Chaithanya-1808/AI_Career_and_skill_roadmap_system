import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.models import (
    Roadmap, RoadmapTask, RoadmapVersion, CareerProfile, User, SkillAssessment
)
from app.services.scoring_service import calculate_skill_gaps

def generate_fallback_roadmap_data(
    career_id: str,
    weekly_hours: int = 14,
    timeline_weeks: int = 16,
    missing_skills: List[str] = None
) -> List[Dict[str, Any]]:
    """
    Deterministic rule-based roadmap generator.
    Guarantees robust, high-quality, prerequisite-ordered task stages even when AI is unavailable.
    """
    if career_id == "full-stack-developer":
        return [
            {
                "stage_number": 1,
                "stage_title": "Foundations & Responsive Frontend",
                "tasks": [
                    {
                        "id": "FSD-T1-1",
                        "title": "Modern Semantic HTML5 & Responsive CSS Grid/Flexbox",
                        "skill_category": "Web Development",
                        "description": "Master semantic elements, accessibility (WCAG), CSS Flexbox, and CSS Grid layout algorithms for modern web interfaces.",
                        "learning_objectives": ["Structure accessible HTML documents", "Build mobile-first fluid grid systems", "Implement responsive media queries"],
                        "recommendation_reason": "Essential building block for all frontend and full-stack engineering.",
                        "prerequisite_task_ids": [],
                        "estimated_hours": max(6, int(weekly_hours * 0.5)),
                        "resources": [
                            {"title": "MDN - HTML Basics", "url": "https://developer.mozilla.org/en-US/docs/Learn/HTML"},
                            {"title": "CSS Tricks - A Complete Guide to Flexbox", "url": "https://css-tricks.com/snippets/css/a-guide-to-flexbox/"}
                        ],
                        "practical_exercises": ["Build a semantic article template", "Create a responsive 3-column pricing grid"],
                        "deliverable": "Responsive Landing Page layout",
                        "validation_quiz_id": "quiz-html-css-01",
                        "status": "available",
                        "priority": "critical",
                        "target_week": 1
                    },
                    {
                        "id": "FSD-T1-2",
                        "title": "Git & GitHub Version Control Workflow",
                        "skill_category": "Software Engineering",
                        "description": "Establish command-line Git proficiency: branches, commits, staging, conflict resolution, and pull requests.",
                        "learning_objectives": ["Initialize repositories and manage staging", "Resolve merge conflicts cleanly", "Publish code to GitHub"],
                        "recommendation_reason": "Version control is mandatory for professional engineering collaboration.",
                        "prerequisite_task_ids": ["FSD-T1-1"],
                        "estimated_hours": max(4, int(weekly_hours * 0.3)),
                        "resources": [
                            {"title": "Git Documentation", "url": "https://git-scm.com/doc"},
                            {"title": "GitHub Skills Interactive Labs", "url": "https://skills.github.com/"}
                        ],
                        "practical_exercises": ["Initialize a local repo and create 3 feature branches", "Simulate and resolve a merge conflict"],
                        "deliverable": "Personal GitHub portfolio repository initialized",
                        "validation_quiz_id": "quiz-git-01",
                        "status": "locked",
                        "priority": "high",
                        "target_week": 2
                    },
                    {
                        "id": "FSD-T1-3",
                        "title": "Project: Responsive Developer Portfolio",
                        "skill_category": "Frontend Development",
                        "description": "Design, build, and deploy a personal developer portfolio website showcasing your skills and contact details.",
                        "learning_objectives": ["Apply semantic HTML and CSS Grid/Flexbox", "Test mobile responsiveness across viewport sizes", "Deploy to GitHub Pages or Vercel"],
                        "recommendation_reason": "Tangible portfolio artifact for recruiters and mentors.",
                        "prerequisite_task_ids": ["FSD-T1-1", "FSD-T1-2"],
                        "estimated_hours": max(8, int(weekly_hours * 0.6)),
                        "resources": [{"title": "Web.dev Responsive Web Design Basics", "url": "https://web.dev/responsive-web-design-basics/"}],
                        "practical_exercises": ["Wireframe portfolio sections", "Implement responsive navigation menu with CSS toggle"],
                        "deliverable": "Live deployed portfolio URL and public GitHub repository",
                        "validation_quiz_id": None,
                        "status": "locked",
                        "priority": "critical",
                        "target_week": 3
                    }
                ]
            },
            {
                "stage_number": 2,
                "stage_title": "Core JavaScript & Modern React",
                "tasks": [
                    {
                        "id": "FSD-T2-1",
                        "title": "Modern JavaScript (ES6+), DOM & Asynchronous Operations",
                        "skill_category": "Programming Fundamentals",
                        "description": "Deep dive into arrow functions, destructuring, modules, DOM APIs, Event Loop, Promises, and async/await.",
                        "learning_objectives": ["Understand event-driven execution and event loop", "Manipulate the browser DOM dynamically", "Consume asynchronous fetch REST APIs with try/catch"],
                        "recommendation_reason": "JavaScript powers both modern client-side and server-side runtimes.",
                        "prerequisite_task_ids": ["FSD-T1-3"],
                        "estimated_hours": max(10, int(weekly_hours * 0.8)),
                        "resources": [
                            {"title": "JavaScript.info - The Modern JavaScript Tutorial", "url": "https://javascript.info/"},
                            {"title": "MDN - Asynchronous JavaScript", "url": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous"}
                        ],
                        "practical_exercises": ["Build an interactive DOM calculator", "Fetch data from a public weather API"],
                        "deliverable": "Interactive API-driven weather widget",
                        "validation_quiz_id": "quiz-js-async-01",
                        "status": "locked",
                        "priority": "critical",
                        "target_week": 4
                    },
                    {
                        "id": "FSD-T2-2",
                        "title": "React Components, Props, Hooks & State Architecture",
                        "skill_category": "Frontend Development",
                        "description": "Learn JSX, functional components, props passing, useState, useEffect, useMemo, and unidirectional data flow.",
                        "learning_objectives": ["Deconstruct UI designs into modular components", "Manage component state with React hooks", "Handle side-effects with useEffect cleanup"],
                        "recommendation_reason": "Industry standard declarative UI library.",
                        "prerequisite_task_ids": ["FSD-T2-1"],
                        "estimated_hours": max(12, int(weekly_hours * 0.9)),
                        "resources": [{"title": "React.dev Official Documentation", "url": "https://react.dev/"}],
                        "practical_exercises": ["Build a dynamic counter with step controls", "Implement an autocomplete search filter"],
                        "deliverable": "Interactive React task management component",
                        "validation_quiz_id": "quiz-react-01",
                        "status": "locked",
                        "priority": "critical",
                        "target_week": 6
                    }
                ]
            },
            {
                "stage_number": 3,
                "stage_title": "Server Architecture & REST APIs",
                "tasks": [
                    {
                        "id": "FSD-T3-1",
                        "title": "Node.js & Express RESTful API Development",
                        "skill_category": "Backend Development",
                        "description": "Understand non-blocking I/O, Express middleware, routing, status codes, and JSON request/response pipelines.",
                        "learning_objectives": ["Structure modular Express routers", "Implement centralized error-handling middleware", "Parse and validate incoming JSON payloads"],
                        "recommendation_reason": "Essential for client-server communication and business logic execution.",
                        "prerequisite_task_ids": ["FSD-T2-2"],
                        "estimated_hours": max(10, int(weekly_hours * 0.8)),
                        "resources": [{"title": "Express.js Official Guide", "url": "https://expressjs.com/en/starter/installing.html"}],
                        "practical_exercises": ["Build a CRUD REST API for a book catalog", "Implement custom logging and validation middleware"],
                        "deliverable": "Tested CRUD REST API with Postman collection",
                        "validation_quiz_id": "quiz-express-01",
                        "status": "locked",
                        "priority": "critical",
                        "target_week": 8
                    },
                    {
                        "id": "FSD-T3-2",
                        "title": "Authentication, JWT & Input Security",
                        "skill_category": "Cybersecurity",
                        "description": "Implement bcrypt password hashing, JSON Web Tokens (JWT), role-based middleware guards, and CORS policies.",
                        "learning_objectives": ["Hash passwords safely with salt rounds", "Issue, sign, and verify JWT bearer tokens", "Sanitize inputs to defend against injection attacks"],
                        "recommendation_reason": "Security and access control are mandatory in production web apps.",
                        "prerequisite_task_ids": ["FSD-T3-1"],
                        "estimated_hours": max(8, int(weekly_hours * 0.6)),
                        "resources": [{"title": "OWASP Authentication Cheat Sheet", "url": "https://cheatsheetseries.owasp.org/"}],
                        "practical_exercises": ["Implement /register and /login endpoints with bcrypt", "Protect private routes with a verifyToken middleware"],
                        "deliverable": "Secure auth microservice with token refresh mechanism",
                        "validation_quiz_id": "quiz-security-01",
                        "status": "locked",
                        "priority": "critical",
                        "target_week": 10
                    }
                ]
            },
            {
                "stage_number": 4,
                "stage_title": "Database Design & SQL Persistence",
                "tasks": [
                    {
                        "id": "FSD-T4-1",
                        "title": "Relational Data Modeling & Advanced SQL Queries",
                        "skill_category": "Databases",
                        "description": "Design normalized schemas (1NF, 2NF, 3NF), primary/foreign keys, multi-table INNER/LEFT JOINs, and indexes.",
                        "learning_objectives": ["Formulate complex SQL queries with JOINs and GROUP BY", "Design normalized database entity relationship diagrams", "Enforce referential integrity with CASCADE constraints"],
                        "recommendation_reason": "Data integrity and high-performance querying form the foundation of backend state.",
                        "prerequisite_task_ids": ["FSD-T3-2"],
                        "estimated_hours": max(10, int(weekly_hours * 0.8)),
                        "resources": [{"title": "PostgreSQL Tutorial", "url": "https://www.postgresqltutorial.com/"}],
                        "practical_exercises": ["Write queries joining users, orders, and products", "Benchmark query performance before and after B-tree index creation"],
                        "deliverable": "Normalized database schema with migration scripts",
                        "validation_quiz_id": "quiz-sql-01",
                        "status": "locked",
                        "priority": "critical",
                        "target_week": 12
                    }
                ]
            },
            {
                "stage_number": 5,
                "stage_title": "Full-Stack Integration, Testing & Capstone",
                "tasks": [
                    {
                        "id": "FSD-T5-1",
                        "title": "Connecting React Frontend with Secured SQL Backend",
                        "skill_category": "Full-Stack Integration",
                        "description": "Integrate React single-page frontend with authenticated Express API and SQL database with optimistic UI updates.",
                        "learning_objectives": ["Manage global authentication state in React", "Handle network errors and loading indicators gracefully", "Implement end-to-end CRUD student management workflow"],
                        "recommendation_reason": "Proves complete end-to-end full-stack capabilities.",
                        "prerequisite_task_ids": ["FSD-T4-1"],
                        "estimated_hours": max(14, int(weekly_hours * 1.0)),
                        "resources": [{"title": "Full Stack Open - University of Helsinki", "url": "https://fullstackopen.com/en/"}],
                        "practical_exercises": ["Implement login modal with token storage", "Create paginated data table connected to backend SQL API"],
                        "deliverable": "Integrated Student Management Portal",
                        "validation_quiz_id": None,
                        "status": "locked",
                        "priority": "critical",
                        "target_week": 14
                    },
                    {
                        "id": "FSD-T5-2",
                        "title": "Automated Testing, Docker Containerization & Deployment",
                        "skill_category": "DevOps & Cloud",
                        "description": "Write automated unit tests (Jest/Pytest), package application with Docker Compose, and deploy with CI/CD.",
                        "learning_objectives": ["Write unit tests for critical business logic", "Create multi-stage Dockerfile builds", "Configure Docker Compose for web and database services"],
                        "recommendation_reason": "Prepares students directly for industry production environments.",
                        "prerequisite_task_ids": ["FSD-T5-1"],
                        "estimated_hours": max(10, int(weekly_hours * 0.7)),
                        "resources": [{"title": "Docker Getting Started", "url": "https://docs.docker.com/get-started/"}],
                        "practical_exercises": ["Write 5 unit tests for backend route controllers", "Write docker-compose.yml to run frontend, backend, and database"],
                        "deliverable": "Containerized application with passing test suite",
                        "validation_quiz_id": "quiz-devops-01",
                        "status": "locked",
                        "priority": "high",
                        "target_week": 16
                    }
                ]
            }
        ]
    else:
        # Generic multi-stage roadmap for other careers
        return [
            {
                "stage_number": 1,
                "stage_title": f"Core Foundations for {career_id.replace('-', ' ').title()}",
                "tasks": [
                    {
                        "id": f"{career_id[:3].upper()}-T1-1",
                        "title": "Fundamental Concepts & Tooling Setup",
                        "skill_category": "Fundamentals",
                        "description": f"Master foundational principles, tools, and best practices for {career_id.replace('-', ' ').title()}.",
                        "learning_objectives": ["Understand domain core concepts", "Set up developer environment", "Execute introductory practice tasks"],
                        "recommendation_reason": "Foundational knowledge required for advanced topics.",
                        "prerequisite_task_ids": [],
                        "estimated_hours": 10,
                        "resources": [{"title": "Official Getting Started Guide", "url": "https://developer.mozilla.org"}],
                        "practical_exercises": ["Set up local development environment", "Run starter project"],
                        "deliverable": "Configured repository and initial working example",
                        "validation_quiz_id": None,
                        "status": "available",
                        "priority": "critical",
                        "target_week": 1
                    }
                ]
            },
            {
                "stage_number": 2,
                "stage_title": f"Core Technical Competencies",
                "tasks": [
                    {
                        "id": f"{career_id[:3].upper()}-T2-1",
                        "title": "Intermediate Techniques & Real-World Application",
                        "skill_category": "Technical Skills",
                        "description": "Apply core techniques to solve structured real-world scenarios.",
                        "learning_objectives": ["Implement intermediate workflows", "Analyze performance and trade-offs"],
                        "recommendation_reason": "Core competency expected in entry-level roles.",
                        "prerequisite_task_ids": [f"{career_id[:3].upper()}-T1-1"],
                        "estimated_hours": 15,
                        "resources": [{"title": "Technical Documentation", "url": "https://docs.python.org/3/"}],
                        "practical_exercises": ["Solve 3 practical scenario exercises"],
                        "deliverable": "Functional project module",
                        "validation_quiz_id": None,
                        "status": "locked",
                        "priority": "high",
                        "target_week": 5
                    }
                ]
            },
            {
                "stage_number": 3,
                "stage_title": "Capstone & Industry Readiness",
                "tasks": [
                    {
                        "id": f"{career_id[:3].upper()}-T3-1",
                        "title": "Capstone Project & Portfolio Preparation",
                        "skill_category": "Projects",
                        "description": "Deliver a comprehensive capstone project following industry standards.",
                        "learning_objectives": ["Integrate all learned skills", "Document architecture and deployment"],
                        "recommendation_reason": "Provides verifiable proof of competence for hiring managers.",
                        "prerequisite_task_ids": [f"{career_id[:3].upper()}-T2-1"],
                        "estimated_hours": 20,
                        "resources": [{"title": "Portfolio & Project Guidelines", "url": "https://github.com"}],
                        "practical_exercises": ["Build, test, and document capstone project"],
                        "deliverable": "Public capstone repository with live documentation",
                        "validation_quiz_id": None,
                        "status": "locked",
                        "priority": "critical",
                        "target_week": 12
                    }
                ]
            }
        ]

def create_or_update_roadmap(
    db: Session,
    user: User,
    career_id: str,
    force_regenerate: bool = False
) -> Roadmap:
    """
    Creates or retrieves the student's personalized roadmap.
    Coordinates AI generation (via Google Gemini) or the deterministic fallback engine.
    """
    career = db.query(CareerProfile).filter(CareerProfile.id == career_id).first()
    if not career:
        career_id = "full-stack-developer"
        career = db.query(CareerProfile).filter(CareerProfile.id == career_id).first()

    existing_roadmap = db.query(Roadmap).filter(
        Roadmap.user_id == user.id,
        Roadmap.career_id == career_id,
        Roadmap.status == "active"
    ).first()

    if existing_roadmap and not force_regenerate:
        return existing_roadmap

    # If forcing regeneration, archive existing
    if existing_roadmap and force_regenerate:
        existing_roadmap.status = "archived"
        db.commit()

    weekly_hours = user.available_hours_per_week or 14
    timeline_weeks = user.target_timeline_weeks or 16

    # Calculate skill gaps for personalized adaptation
    gap_report = calculate_skill_gaps(db, user.id, career_id)
    missing_skill_names = [s["skill_name"] for s in gap_report["recommended_priority_skills"]]

    # Try AI Generation first if GEMINI_API_KEY is configured
    from app.services.ai_service import try_generate_ai_roadmap
    ai_roadmap_data, is_ai_success, model_used = try_generate_ai_roadmap(
        user=user,
        career=career,
        weekly_hours=weekly_hours,
        timeline_weeks=timeline_weeks,
        gap_report=gap_report
    )

    if not is_ai_success or not ai_roadmap_data:
        stages_data = generate_fallback_roadmap_data(
            career_id=career_id,
            weekly_hours=weekly_hours,
            timeline_weeks=timeline_weeks,
            missing_skills=missing_skill_names
        )
        is_fallback = True
        is_ai = False
        model_name = "Rule-Based Deterministic Engine (Fallback)"
    else:
        stages_data = ai_roadmap_data
        is_fallback = False
        is_ai = True
        model_name = model_used

    total_stages = len(stages_data)
    total_estimated_hours = 0
    all_tasks = []

    for stage in stages_data:
        for t in stage.get("tasks", []):
            total_estimated_hours += t.get("estimated_hours", 5)

    roadmap = Roadmap(
        user_id=user.id,
        career_id=career_id,
        title=f"Personalized Roadmap: {career.title}",
        total_stages=total_stages,
        estimated_weeks=timeline_weeks,
        total_hours=total_estimated_hours,
        is_ai_generated=is_ai,
        is_fallback=is_fallback,
        ai_model_used=model_name,
        adaptation_count=0,
        overall_progress_percentage=0.0,
        status="active"
    )
    db.add(roadmap)
    db.commit()

    # Create Roadmap Tasks
    first_task = True
    for stage in stages_data:
        stage_num = stage.get("stage_number", 1)
        stage_title = stage.get("stage_title", f"Stage {stage_num}")
        for t in stage.get("tasks", []):
            task_status = "locked"
            if len(t.get("prerequisite_task_ids", [])) == 0:
                task_status = "in_progress" if first_task else "available"
                first_task = False

            task_rec = RoadmapTask(
                id=f"{roadmap.id[:8]}-{t.get('id', 'T')}",
                roadmap_id=roadmap.id,
                stage_number=stage_num,
                stage_title=stage_title,
                title=t.get("title", "Untitled Task"),
                skill_category=t.get("skill_category", "General"),
                description=t.get("description", ""),
                learning_objectives=t.get("learning_objectives", []),
                recommendation_reason=t.get("recommendation_reason"),
                prerequisite_task_ids=t.get("prerequisite_task_ids", []),
                estimated_hours=t.get("estimated_hours", 5),
                resources=t.get("resources", []),
                practical_exercises=t.get("practical_exercises", []),
                deliverable=t.get("deliverable"),
                validation_quiz_id=t.get("validation_quiz_id"),
                status=task_status,
                priority=t.get("priority", "high"),
                target_week=t.get("target_week", stage_num * 2),
                actual_hours_spent=0.0
            )
            db.add(task_rec)

    db.commit()

    # Record initial snapshot in RoadmapVersion
    version = RoadmapVersion(
        roadmap_id=roadmap.id,
        version_number=1,
        change_reason="Initial roadmap generated from profile and diagnostic skill assessment",
        snapshot={"stages": stages_data, "weekly_hours": weekly_hours, "timeline_weeks": timeline_weeks}
    )
    db.add(version)
    db.commit()

    return roadmap

def update_task_progress(
    db: Session,
    roadmap_id: str,
    task_id: str,
    new_status: str,
    actual_hours: float = 0.0,
    evidence_notes: str = None
) -> Roadmap:
    """
    Updates task status (in_progress, completed) and automatically unlocks dependent tasks
    whose prerequisites have now been satisfied.
    """
    task = db.query(RoadmapTask).filter(
        RoadmapTask.roadmap_id == roadmap_id,
        RoadmapTask.id == task_id
    ).first()

    if not task:
        raise ValueError("Task not found")

    task.status = new_status
    if actual_hours > 0:
        task.actual_hours_spent += actual_hours
    if evidence_notes:
        task.evidence_notes = evidence_notes
    if new_status == "completed":
        task.completed_at = datetime.now(timezone.utc)

    # Check and unlock dependent tasks
    if new_status == "completed":
        all_tasks = db.query(RoadmapTask).filter(RoadmapTask.roadmap_id == roadmap_id).all()
        completed_ids = set(t.id for t in all_tasks if t.status == "completed")
        # Also include suffix ID e.g. FSD-T1-1
        completed_suffixes = set(t.id.split("-", 1)[-1] if "-" in t.id else t.id for t in all_tasks if t.status == "completed")

        for other in all_tasks:
            if other.status == "locked":
                prereqs = other.prerequisite_task_ids or []
                # Check if all prereqs are in completed_ids or completed_suffixes
                if all((p in completed_ids or p in completed_suffixes) for p in prereqs):
                    other.status = "available"

    # Recalculate roadmap overall progress percentage
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    all_tasks = db.query(RoadmapTask).filter(RoadmapTask.roadmap_id == roadmap_id).all()
    total_count = len(all_tasks)
    completed_count = sum(1 for t in all_tasks if t.status == "completed")

    if total_count > 0:
        roadmap.overall_progress_percentage = round((completed_count / total_count) * 100.0, 1)
        if completed_count == total_count:
            roadmap.status = "completed"

    roadmap.updated_at = datetime.now(timezone.utc)
    db.commit()
    return roadmap

