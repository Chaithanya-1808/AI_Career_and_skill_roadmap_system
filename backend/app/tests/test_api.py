import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.seed_data import seed_database
from app.main import app

# In-memory SQLite database with StaticPool for isolated automated testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_database(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    return TestClient(app)

def test_root_and_health(client):
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["status"] == "operational"

    r_health = client.get("/api/health")
    assert r_health.status_code == 200
    assert r_health.json()["status"] == "healthy"

def test_student_registration_and_login(client):
    # 1. Successful registration
    reg_data = {
        "email": "priya.student@college.edu",
        "password": "SecurePassword123!",
        "full_name": "Priya Sharma"
    }
    r_reg = client.post("/api/auth/register", json=reg_data)
    assert r_reg.status_code == 200
    reg_json = r_reg.json()
    assert "access_token" in reg_json
    assert reg_json["user"]["email"] == reg_data["email"]
    assert "student" in reg_json["user"]["roles"]

    # 2. Duplicate registration rejected
    r_dup = client.post("/api/auth/register", json=reg_data)
    assert r_dup.status_code == 400

    # 3. Successful login
    r_login = client.post("/api/auth/login", json={
        "email": reg_data["email"],
        "password": reg_data["password"]
    })
    assert r_login.status_code == 200
    token = r_login.json()["access_token"]
    assert len(token) > 20

    # 4. Invalid credentials rejected
    r_bad = client.post("/api/auth/login", json={
        "email": reg_data["email"],
        "password": "WrongPassword999!"
    })
    assert r_bad.status_code == 401

def test_demo_login_chaithanya(client):
    r = client.post("/api/auth/demo-login")
    assert r.status_code == 200
    data = r.json()
    assert data["user"]["full_name"] == "Chaithanya"
    assert data["user"]["email"] == "chaithanya@student.college.edu"
    assert "student" in data["user"]["roles"]
    assert data["user"]["available_hours_per_week"] == 14
    assert "Year 3" in data["user"]["current_semester"]

def test_career_exploration_and_recommendations(client):
    # 1. Demo login
    auth_resp = client.post("/api/auth/demo-login").json()
    token = auth_resp["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. List careers
    r_careers = client.get("/api/careers")
    assert r_careers.status_code == 200
    careers = r_careers.json()
    assert len(careers) >= 12
    titles = [c["title"] for c in careers]
    assert "Full-Stack Developer" in titles
    assert "AI/ML Engineer" in titles
    assert "Cybersecurity Analyst" in titles

    # 3. Recommendation engine with Chaithanya's interests
    rec_payload = {
        "academic_interests": ["Website development", "Problem-solving"],
        "existing_skills": ["HTML5 & Modern CSS", "C Programming"],
        "preferred_careers": ["Full-Stack Developer"]
    }
    r_rec = client.post("/api/careers/recommend", json=rec_payload, headers=headers)
    assert r_rec.status_code == 200
    rec_json = r_rec.json()
    assert "recommended_careers" in rec_json
    top = rec_json["top_recommendation"]
    assert top["career_title"] == "Full-Stack Developer"
    assert top["estimated_match_score"] >= 65
    assert len(top["matching_skills"]) > 0
    assert "disclaimer" in rec_json

def test_diagnostic_assessment_flow_and_anti_cheat_scoring(client):
    # 1. Login
    auth_resp = client.post("/api/auth/demo-login").json()
    token = auth_resp["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Start assessment
    start_payload = {
        "career_id": "full-stack-developer",
        "camera_monitoring_enabled": True
    }
    r_start = client.post("/api/assessments/start", json=start_payload, headers=headers)
    assert r_start.status_code == 200
    attempt = r_start.json()
    attempt_id = attempt["id"]
    assert attempt["camera_monitoring_enabled"] is True
    assert attempt["status"] == "in_progress"
    assert len(attempt["questions"]) > 0

    # 3. Verify security: correct answers must NEVER be sent to client!
    for q in attempt["questions"]:
        assert "correct_option_id" not in q
        assert len(q["options"]) > 0

    # 4. Log integrity events (e.g. 1 tab switch)
    r_event = client.post("/api/integrity/event", json={
        "attempt_id": attempt_id,
        "event_type": "tab_switch",
        "details": {"duration_ms": 1200}
    }, headers=headers)
    assert r_event.status_code == 200

    # 5. Submit answers
    # Choose option 'A' or 'B' for each question
    answers = {q["id"]: q["options"][0]["id"] for q in attempt["questions"]}
    submit_payload = {
        "attempt_id": attempt_id,
        "answers": answers,
        "time_spent_seconds": 320
    }
    r_sub = client.post("/api/assessments/submit", json=submit_payload, headers=headers)
    assert r_sub.status_code == 200
    res = r_sub.json()
    assert "score_percentage" in res
    assert "category_scores" in res
    assert "review_items" in res
    assert len(res["review_items"]) == len(attempt["questions"])

    # 6. Verify duplicate submission is strictly rejected
    r_dup = client.post("/api/assessments/submit", json=submit_payload, headers=headers)
    assert r_dup.status_code == 400

def test_skill_gap_analysis(client):
    auth_resp = client.post("/api/auth/demo-login").json()
    headers = {"Authorization": f"Bearer {auth_resp['access_token']}"}

    r_gap = client.get("/api/skills/gap-report?career_id=full-stack-developer", headers=headers)
    assert r_gap.status_code == 200
    gap = r_gap.json()
    assert gap["target_career_id"] == "full-stack-developer"
    assert "overall_match_percentage" in gap
    assert "recommended_priority_skills" in gap
    assert len(gap["recommended_priority_skills"]) > 0

def test_roadmap_generation_and_task_lifecycle(client):
    auth_resp = client.post("/api/auth/demo-login").json()
    headers = {"Authorization": f"Bearer {auth_resp['access_token']}"}

    # Generate roadmap
    r_gen = client.post("/api/roadmaps/generate", json={
        "career_id": "full-stack-developer",
        "force_regenerate": True
    }, headers=headers)
    assert r_gen.status_code == 200
    roadmap = r_gen.json()
    assert roadmap["career_id"] == "full-stack-developer"
    assert len(roadmap["tasks"]) >= 5

    # Check task ordering and initial statuses
    tasks = roadmap["tasks"]
    stage_1_tasks = [t for t in tasks if t["stage_number"] == 1]
    assert len(stage_1_tasks) >= 2
    # At least one task is available or in_progress
    assert any(t["status"] in ("in_progress", "available") for t in stage_1_tasks)

    # Find a locked task and verify it cannot be marked completed directly
    locked_tasks = [t for t in tasks if t["status"] == "locked"]
    if locked_tasks:
        target_locked = locked_tasks[0]
        r_locked_fail = client.post(
            f"/api/roadmaps/tasks/{target_locked['id']}/status",
            json={"status": "completed"},
            headers=headers
        )
        assert r_locked_fail.status_code == 400

    # Mark the first available task completed
    first_task = next(t for t in tasks if t["status"] in ("in_progress", "available"))
    r_comp = client.post(
        f"/api/roadmaps/tasks/{first_task['id']}/status",
        json={"status": "completed", "actual_hours_spent": 5.0, "evidence_notes": "Completed exercises."},
        headers=headers
    )
    assert r_comp.status_code == 200
    updated_roadmap = r_comp.json()
    assert updated_roadmap["overall_progress_percentage"] > 0

def test_weekly_planner(client):
    auth_resp = client.post("/api/auth/demo-login").json()
    headers = {"Authorization": f"Bearer {auth_resp['access_token']}"}

    r_plan = client.get("/api/planner/weekly", headers=headers)
    assert r_plan.status_code == 200
    plan = r_plan.json()
    assert plan["weekly_target_hours"] == 14
    assert len(plan["days"]) == 7

def test_project_submission(client):
    auth_resp = client.post("/api/auth/demo-login").json()
    headers = {"Authorization": f"Bearer {auth_resp['access_token']}"}

    # Invalid repo URL rejected
    r_bad = client.post("/api/projects/submit", json={
        "project_id": "fsd-proj-portfolio",
        "repository_url": "invalid_url"
    }, headers=headers)
    assert r_bad.status_code == 400

    # Valid GitHub repo accepted
    r_good = client.post("/api/projects/submit", json={
        "project_id": "fsd-proj-portfolio",
        "repository_url": "https://github.com/chaithanya-student/responsive-portfolio",
        "live_demo_url": "https://chaithanya-portfolio.vercel.app",
        "submission_notes": "Built with semantic HTML5 and modern CSS Grid layout."
    }, headers=headers)
    assert r_good.status_code == 200
    assert r_good.json()["status"] == "pending"

def test_certificate_issuance_and_public_verification(client):
    auth_resp = client.post("/api/auth/demo-login").json()
    headers = {"Authorization": f"Bearer {auth_resp['access_token']}"}

    # Create a high scoring attempt (85%) so Chaithanya qualifies for diagnostic distinction
    start_resp = client.post("/api/assessments/start", json={"career_id": "full-stack-developer"}, headers=headers).json()
    attempt_id = start_resp["id"]

    # Fetch DB correct answers to achieve high score for test
    db = TestingSessionLocal()
    from app.models.models import AssessmentQuestion
    q_ids = [q["id"] for q in start_resp["questions"]]
    questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.id.in_(q_ids)).all()
    correct_answers = {q.id: q.correct_option_id for q in questions}
    db.close()

    # Submit 85%+ score
    client.post("/api/assessments/submit", json={
        "attempt_id": attempt_id,
        "answers": correct_answers,
        "time_spent_seconds": 250
    }, headers=headers)

    # Claim certificate
    r_claim = client.post("/api/certificates/claim", json={
        "achievement_type": "diagnostic_distinction",
        "career_id": "full-stack-developer"
    }, headers=headers)
    assert r_claim.status_code == 200
    cert = r_claim.json()
    assert "ACR-" in cert["certificate_id"]
    assert cert["student_name"] == "Chaithanya"

    # Public verification (no auth headers required!)
    r_verif = client.get(f"/api/certificates/verify/{cert['certificate_id']}")
    assert r_verif.status_code == 200
    verif = r_verif.json()
    assert verif["is_valid"] is True
    assert verif["student_name"] == "Chaithanya"

    # Invalid ID returns 404
    r_invalid = client.get("/api/certificates/verify/NON-EXISTENT-ID-1234")
    assert r_invalid.status_code == 404

def test_mentor_share_flow(client):
    auth_resp = client.post("/api/auth/demo-login").json()
    headers = {"Authorization": f"Bearer {auth_resp['access_token']}"}

    r_share = client.post("/api/mentors/share", json={
        "mentor_email": "prof.sharma@college.edu",
        "can_review_roadmaps": True,
        "can_approve_projects": True,
        "can_view_assessments": True
    }, headers=headers)
    assert r_share.status_code == 200
    share = r_share.json()
    assert "MSH-" in share["share_token"]
    assert share["mentor_email"] == "prof.sharma@college.edu"

def test_admin_authorization(client):
    # 1. Student cannot access admin endpoints
    auth_resp = client.post("/api/auth/demo-login").json()
    student_headers = {"Authorization": f"Bearer {auth_resp['access_token']}"}
    r_unauth = client.get("/api/admin/stats", headers=student_headers)
    assert r_unauth.status_code == 403

    # 2. Admin can access admin endpoints
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@aicareer.internal",
        "password": "AdminSecurePass2026!"
    }).json()
    admin_headers = {"Authorization": f"Bearer {admin_login['access_token']}"}
    r_admin = client.get("/api/admin/stats", headers=admin_headers)
    assert r_admin.status_code == 200
    stats = r_admin.json()
    assert stats["total_students"] >= 1
