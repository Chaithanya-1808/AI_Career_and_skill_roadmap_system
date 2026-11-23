# -*- coding: utf-8 -*-
from reportlab.lib import colors
from reportlab.platypus import Paragraph, Table, TableStyle, Spacer, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT

# Reusable Typography Styles for Diagrams
title_style_blue = ParagraphStyle('DiagTitleBlue', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=colors.HexColor("#1e3a8a"))
title_style_indigo = ParagraphStyle('DiagTitleIndigo', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=colors.HexColor("#312e81"))
title_style_green = ParagraphStyle('DiagTitleGreen', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=colors.HexColor("#14532d"))
title_style_amber = ParagraphStyle('DiagTitleAmber', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=colors.HexColor("#78350f"))
title_style_purple = ParagraphStyle('DiagTitlePurple', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=colors.HexColor("#581c87"))
title_style_slate = ParagraphStyle('DiagTitleSlate', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=colors.HexColor("#0f172a"))

body_style_diag = ParagraphStyle('DiagBody', fontName='Helvetica', fontSize=7.5, leading=10, textColor=colors.HexColor("#1e293b"))
body_style_diag_center = ParagraphStyle('DiagBodyCenter', fontName='Helvetica', fontSize=7.5, leading=10, alignment=TA_CENTER, textColor=colors.HexColor("#1e293b"))
arrow_style_down = ParagraphStyle('ArrowDown', fontName='Helvetica-Bold', fontSize=8.5, leading=10, alignment=TA_CENTER, textColor=colors.HexColor("#2563eb"))
arrow_style_right = ParagraphStyle('ArrowRight', fontName='Helvetica-Bold', fontSize=8.5, leading=10, alignment=TA_CENTER, textColor=colors.HexColor("#2563eb"))

header_white_blue = ParagraphStyle('HWB', fontName='Helvetica-Bold', fontSize=8.5, leading=11, alignment=TA_CENTER, textColor=colors.white)
header_white_indigo = ParagraphStyle('HWI', fontName='Helvetica-Bold', fontSize=8.5, leading=11, alignment=TA_CENTER, textColor=colors.white)
header_white_green = ParagraphStyle('HWG', fontName='Helvetica-Bold', fontSize=8.5, leading=11, alignment=TA_CENTER, textColor=colors.white)
header_white_amber = ParagraphStyle('HWA', fontName='Helvetica-Bold', fontSize=8.5, leading=11, alignment=TA_CENTER, textColor=colors.white)

TOTAL_W = 485

def make_box(p_title, p_body, bg_hex, border_hex, width=TOTAL_W):
    content = [p_title, Spacer(1, 2), p_body]
    t = Table([[content]], colWidths=[width])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(bg_hex)),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor(border_hex)),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    return t

def make_arrow_down(label=""):
    text = f"&darr; {label}" if label else "&darr;"
    p = Paragraph(f"<b>{text}</b>", arrow_style_down)
    t = Table([[p]], colWidths=[TOTAL_W])
    t.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('PADDING', (0,0), (-1,-1), 1),
    ]))
    return t

# -------------------------------------------------------------
# FIG 6.1: Student Profile Management Workflow
# -------------------------------------------------------------
def build_fig_6_1():
    b1 = make_box(
        Paragraph("1. Student Client (React 18 / TypeScript Form)", title_style_blue),
        Paragraph("Enters 15 profile dimensions: Degree, Branch (CSE), Year, Semester, Grad Year, 4-tier Technical Skills (Beg/Basic/Int/Adv), Target Career, and Daily Study Hours (1-8 hrs/day). Client-side validation checks required fields.", body_style_diag),
        "#eff6ff", "#3b82f6"
    )
    a1 = make_arrow_down("PUT /api/auth/profile (Authenticated via Bearer JWT)")
    b2 = make_box(
        Paragraph("2. FastAPI Application Controller & Math Calculation Engine", title_style_purple),
        Paragraph("Validates request with Pydantic v2 pre-sanitizers. Calculates profile completion % = (Valid Fields / 15) * 100. Computes available weekly study hours = (daily_study_hours * 7). Sets onboarding_completed = (completion_percentage >= 80%).", body_style_diag),
        "#f5f3ff", "#8b5cf6"
    )
    a2 = make_arrow_down("Synchronized Relational Database Upsert Transactions")
    b3 = make_box(
        Paragraph("3. Relational Database Persistence (profiles & skill_assessments Tables)", title_style_green),
        Paragraph("Upserts user demographic details into profiles table. Automatically seeds baseline self-reported skills into skill_assessments table with evaluation_type='self-reported' for subsequent gap comparison.", body_style_diag),
        "#f0fdf4", "#22c55e"
    )
    a3 = make_arrow_down("HTTP 200 OK (Sanitized UserOut Response Payload)")
    b4 = make_box(
        Paragraph("4. Dashboard UI State Synchronization & Milestone Unlocking", title_style_blue),
        Paragraph("Frontend updates authentication store, displays real-time profile completion progress indicator, and unlocks Career Recommendation and Diagnostic Assessment modules.", body_style_diag),
        "#ecfeff", "#06b6d4"
    )
    return [b1, a1, b2, a2, b3, a3, b4]

# -------------------------------------------------------------
# FIG 6.2: Career Recommendation Engine
# -------------------------------------------------------------
def build_fig_6_2():
    b1 = make_box(
        Paragraph("1. Input Student Capability & Preference Vector", title_style_blue),
        Paragraph("Student profile parameters: Technical Skills with 4-tier proficiency, Academic Interests, Primary Career Choice, and Collegiate Branch (e.g. Computer Science & Engineering).", body_style_diag),
        "#eff6ff", "#2563eb"
    )
    a1 = make_arrow_down("POST /api/careers/recommend (Career Match Engine)")
    
    # 3-column processing card
    w3 = (TOTAL_W - 8) / 3.0
    c1 = [
        Paragraph("<b>Skill Proficiency Points</b>", title_style_amber),
        Spacer(1, 2),
        Paragraph("• Advanced = 12 pts<br/>• Intermediate = 9 pts<br/>• Basic = 6 pts<br/>• Beginner = 4 pts", body_style_diag)
    ]
    c2 = [
        Paragraph("<b>Contextual Bonuses</b>", title_style_purple),
        Spacer(1, 2),
        Paragraph("• Interest Alignment: +15 pts<br/>• Primary Preference: +25 pts<br/>• Branch Affinity: +10 pts", body_style_diag)
    ]
    c3 = [
        Paragraph("<b>Normalization</b>", title_style_green),
        Spacer(1, 2),
        Paragraph("Raw score normalized:<br/><b>Match % = Min(98%,<br/>Max(25%, (Raw/120)*100))</b>", body_style_diag)
    ]
    matrix_t = Table([[c1, c2, c3]], colWidths=[w3, w3, w3])
    matrix_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#fefce8")),
        ('BOX', (0,0), (0,0), 1, colors.HexColor("#ca8a04")),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#faf5ff")),
        ('BOX', (1,0), (1,0), 1, colors.HexColor("#9333ea")),
        ('BACKGROUND', (2,0), (2,0), colors.HexColor("#f0fdf4")),
        ('BOX', (2,0), (2,0), 1, colors.HexColor("#16a34a")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    
    a2 = make_arrow_down("Ranked Order Output (Descending by Match %)")
    b3 = make_box(
        Paragraph("3. Output: Rank-Ordered Career Portfolio & Alignment Badges", title_style_green),
        Paragraph("Returns top recommended career role, quantitative compatibility percentage, list of matching verified skills, missing prerequisite skills, and estimated entry salary ranges.", body_style_diag),
        "#ecfdf5", "#059669"
    )
    return [b1, a1, matrix_t, a2, b3]

# -------------------------------------------------------------
# FIG 6.3: Diagnostic Assessment & Integrity Workflow
# -------------------------------------------------------------
def build_fig_6_3():
    # 2-column mode selector
    w2 = (TOTAL_W - 6) / 2.0
    m1 = [
        Paragraph("<b>Standard Mode (Default)</b>", title_style_slate),
        Spacer(1, 2),
        Paragraph("Camera hardware remains fully off. Enforces zero webcam access, guaranteeing student privacy in shared/hostel environments.", body_style_diag)
    ]
    m2 = [
        Paragraph("<b>Monitored Mode (Voluntary)</b>", title_style_amber),
        Spacer(1, 2),
        Paragraph("Student voluntarily enables local browser webcam preview. Real-time tab switch and window blur events logged to server.", body_style_diag)
    ]
    mode_t = Table([[m1, m2]], colWidths=[w2, w2])
    mode_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (0,0), 1, colors.HexColor("#64748b")),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#fef3c7")),
        ('BOX', (1,0), (1,0), 1, colors.HexColor("#d97706")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))

    a1 = make_arrow_down("POST /api/assessments/start (Draw 10 Randomized Questions)")
    b2 = make_box(
        Paragraph("2. Server Question Sanitization & Answer Key Protection", title_style_indigo),
        Paragraph("Backend draws 10 questions for selected career. Crucially, correct_option_id is stripped on the server prior to network transmission, making client inspect-element cheating impossible. Creates attempt record with 15-minute expiration.", body_style_diag),
        "#e0e7ff", "#4338ca"
    )
    a2 = make_arrow_down("15-Minute Timed Client Exam Room (Anti-Skew Countdown)")
    b3 = make_box(
        Paragraph("3. Client Exam Room & Real-Time Integrity Logging", title_style_blue),
        Paragraph("Student navigates questions via numbered palette. Client countdown starts at exactly 15:00. Window blur / tab switch events immediately post telemetry to /api/integrity/event.", body_style_diag),
        "#ecfeff", "#0891b2"
    )
    a3 = make_arrow_down("POST /api/assessments/{id}/submit (Answer Map & Time Spent)")
    b4 = make_box(
        Paragraph("4. Server-Side Answer Key Evaluation & Proficiency Upgrade", title_style_green),
        Paragraph("FastAPI matches submitted options against database keys. Calculates Score % = (Correct / 10) * 100. Updates verified proficiencies in skill_assessments. Returns score report with per-question technical explanations.", body_style_diag),
        "#dcfce7", "#15803d"
    )
    return [mode_t, a1, b2, a2, b3, a3, b4]

# -------------------------------------------------------------
# FIG 6.4: Skill Gap Analysis Architecture
# -------------------------------------------------------------
def build_fig_6_4():
    w2 = (TOTAL_W - 6) / 2.0
    s1 = [
        Paragraph("<b>Assessed Student Skills</b>", title_style_blue),
        Spacer(1, 2),
        Paragraph("Queried from skill_assessments table containing empirical diagnostic scores and self-reported proficiencies (Scale 1.0 - 4.0).", body_style_diag)
    ]
    s2 = [
        Paragraph("<b>Career Benchmark Requirements</b>", title_style_purple),
        Spacer(1, 2),
        Paragraph("Queried from career_skill_requirements table containing target proficiencies and importance weights (Critical, High, Medium).", body_style_diag)
    ]
    inp_t = Table([[s1, s2]], colWidths=[w2, w2])
    inp_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#eff6ff")),
        ('BOX', (0,0), (0,0), 1, colors.HexColor("#2563eb")),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#faf5ff")),
        ('BOX', (1,0), (1,0), 1, colors.HexColor("#7c3aed")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))

    a1 = make_arrow_down("GET /api/skills/gap-report (Mathematical Skill Gap Engine)")
    b2 = make_box(
        Paragraph("2. Mathematical Gap Quantification & Weighting Engine", title_style_amber),
        Paragraph("• Delta Calculation: Delta = Max(0.0, Target_Proficiency - Current_Proficiency)<br/>• Importance Weighting: Critical (Weight = 3.0), High (Weight = 2.0), Medium (Weight = 1.0)<br/>• Overall Career Match %: Round([1.0 - (Total_Weighted_Gap / Total_Weighted_Target)] * 100.0)<br/>• Deficiency Triage: Categorizes gaps into Critical Priority, High Priority, and Mastered Skills.", body_style_diag),
        "#fffbeb", "#d97706"
    )
    a2 = make_arrow_down("Transformed Deliverables Payload")
    
    o1 = [
        Paragraph("<b>Recharts Polar Radar Dataset</b>", title_style_purple),
        Spacer(1, 2),
        Paragraph("Multi-axis SVG radar visualization comparing verified proficiency against target benchmark on radial axes.", body_style_diag)
    ]
    o2 = [
        Paragraph("<b>Prioritized Remediation Feed</b>", title_style_green),
        Spacer(1, 2),
        Paragraph("Ordered list of deficient competencies with estimated remediation hours; directly feeds into Roadmap Synthesis.", body_style_diag)
    ]
    out_t = Table([[o1, o2]], colWidths=[w2, w2])
    out_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#f5f3ff")),
        ('BOX', (0,0), (0,0), 1, colors.HexColor("#8b5cf6")),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#f0fdf4")),
        ('BOX', (1,0), (1,0), 1, colors.HexColor("#16a34a")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    return [inp_t, a1, b2, a2, out_t]

# -------------------------------------------------------------
# FIG 6.5: Dual-Engine Roadmap Generation Flow
# -------------------------------------------------------------
def build_fig_6_5():
    b1 = make_box(
        Paragraph("1. Roadmap Generation Trigger (POST /api/roadmaps/generate)", title_style_blue),
        Paragraph("Initiated by student. Passes student target career, confirmed skill gap report, available study hours (daily hours * 7), and preparation timeline.", body_style_diag),
        "#eff6ff", "#3b82f6"
    )
    a1 = make_arrow_down("API Key & Connectivity Decision Gateway")
    
    w2 = (TOTAL_W - 6) / 2.0
    eng1 = [
        Paragraph("<b>Primary: Google Gemini AI Engine</b>", title_style_purple),
        Spacer(1, 2),
        Paragraph("Invokes Google Gemini 2.5 API with strict ROADMAP_SCHEMA JSON validation. Synthesizes a structured 5-stage customized curriculum.", body_style_diag)
    ]
    eng2 = [
        Paragraph("<b>Fallback: Deterministic Rule Graph</b>", title_style_slate),
        Spacer(1, 2),
        Paragraph("Offline topological graph algorithm. Evaluates industry standard prerequisite DAGs; guarantees 100% zero-downtime uptime.", body_style_diag)
    ]
    fork_t = Table([[eng1, eng2]], colWidths=[w2, w2])
    fork_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#f5f3ff")),
        ('BOX', (0,0), (0,0), 1, colors.HexColor("#7c3aed")),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#f1f5f9")),
        ('BOX', (1,0), (1,0), 1, colors.HexColor("#475569")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))

    a2 = make_arrow_down("DAG Prerequisite Dependency Linker")
    b3 = make_box(
        Paragraph("3. Directed Acyclic Graph (DAG) Task Orchestration", title_style_indigo),
        Paragraph("Enforces prerequisite rules: Stage 1 tasks initialized to status='available'; all downstream tasks (Stages 2 to 5) initialized to status='locked' until prerequisite tasks are marked completed.", body_style_diag),
        "#e0e7ff", "#4338ca"
    )
    a3 = make_arrow_down("Database Persistence & Interactive Timeline UI")
    b4 = make_box(
        Paragraph("4. Output: roadmaps & roadmap_tasks Records", title_style_green),
        Paragraph("Renders interactive multi-stage timeline, milestone deliverables, project prompts, and progress completion percentages.", body_style_diag),
        "#ecfdf5", "#059669"
    )
    return [b1, a1, fork_t, a2, b3, a3, b4]

# -------------------------------------------------------------
# FIG 6.6: Resources and Project Submission Lifecycle
# -------------------------------------------------------------
def build_fig_6_6():
    w2 = (TOTAL_W - 6) / 2.0
    r1 = [
        Paragraph("<b>Step 1: Explore Curated Materials</b>", title_style_blue),
        Spacer(1, 2),
        Paragraph("Student explores verified official documentation, video courses, and structured capstone project specifications.", body_style_diag)
    ]
    r2 = [
        Paragraph("<b>Step 2: Practical Implementation</b>", title_style_green),
        Spacer(1, 2),
        Paragraph("Student writes code locally, builds full-stack features, and pushes source code to their public GitHub repository.", body_style_diag)
    ]
    row1_t = Table([[r1, r2]], colWidths=[w2, w2])
    row1_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#eff6ff")),
        ('BOX', (0,0), (0,0), 1, colors.HexColor("#2563eb")),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#f0fdf4")),
        ('BOX', (1,0), (1,0), 1, colors.HexColor("#16a34a")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    
    a1 = make_arrow_down("POST /api/projects/submit (GitHub URL, Live Demo Link, Implementation Notes)")
    b3 = make_box(
        Paragraph("Step 3: Project Submission & Review Queue", title_style_amber),
        Paragraph("FastAPI validates URL format, creates project_submissions row with status='pending', and places the submission into the faculty mentor review queue.", body_style_diag),
        "#fffbeb", "#d97706"
    )
    a2 = make_arrow_down("Faculty / Mentor Evaluation & Decision")
    b4 = make_box(
        Paragraph("Step 4: Mentor Approval & Roadmap Milestone Unlocking", title_style_purple),
        Paragraph("Mentor reviews code and approves submission: status becomes 'approved', audit log entry is recorded, and the corresponding practical deliverable task in roadmap_tasks is automatically unlocked.", body_style_diag),
        "#f5f3ff", "#7c3aed"
    )
    return [row1_t, a1, b3, a2, b4]

# -------------------------------------------------------------
# FIG 6.7: Progress Tracking & Study Planner Flow
# -------------------------------------------------------------
def build_fig_6_7():
    w2 = (TOTAL_W - 6) / 2.0
    p1 = [
        Paragraph("<b>Active Roadmap Milestones</b>", title_style_blue),
        Spacer(1, 2),
        Paragraph("Open tasks with status='available' or 'in_progress' and estimated task duration hours.", body_style_diag)
    ]
    p2 = [
        Paragraph("<b>Weekly Study Budget</b>", title_style_indigo),
        Spacer(1, 2),
        Paragraph("Calculated dynamically as: (study_hours_per_day * 7) e.g., 2 hrs/day = 14 hours/week target.", body_style_diag)
    ]
    inp_t = Table([[p1, p2]], colWidths=[w2, w2])
    inp_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#eff6ff")),
        ('BOX', (0,0), (0,0), 1, colors.HexColor("#3b82f6")),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#e0e7ff")),
        ('BOX', (1,0), (1,0), 1, colors.HexColor("#6366f1")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))

    a1 = make_arrow_down("7-Day Calendar Scheduling Engine")
    b2 = make_box(
        Paragraph("2. Weekly 7-Day Agenda Scheduling (Monday through Sunday)", title_style_purple),
        Paragraph("Distributes available roadmap tasks across 7 calendar days to prevent student burnout, ensuring daily assigned study hours do not exceed the student's daily hour target.", body_style_diag),
        "#f5f3ff", "#8b5cf6"
    )
    a2 = make_arrow_down("Student Marks Task 'completed' (Verify Prerequisites)")
    b3 = make_box(
        Paragraph("3. Prerequisite Graph Cascade & Metric Recalculation", title_style_green),
        Paragraph("Server verifies prerequisite satisfaction. Updates task status to 'completed'. Evaluates downstream locked tasks; if all prerequisites are fulfilled, unlocks them to status='available'. Dynamically recalculates Roadmap Completion % = (Completed Tasks / Total Tasks) * 100.", body_style_diag),
        "#dcfce7", "#15803d"
    )
    return [inp_t, a1, b2, a2, b3]

# -------------------------------------------------------------
# FIG 6.8: Certificate Issuance and Verification Architecture
# -------------------------------------------------------------
def build_fig_6_8():
    b1 = make_box(
        Paragraph("1. Eligibility Validation Gateway (POST /api/certificates/generate)", title_style_amber),
        Paragraph("• Diagnostic Distinction: Verifies diagnostic assessment score >= 70.0% in assessment_attempts.<br/>• Stage Completion: Verifies at least 2 Stage 1 tasks are marked completed in roadmap_tasks.", body_style_diag),
        "#fffbeb", "#d97706"
    )
    a1 = make_arrow_down("Criteria Verified: Proceed to Credential Generation")
    
    w3 = (TOTAL_W - 8) / 3.0
    c1 = [
        Paragraph("<b>Unique Certificate ID</b>", title_style_blue),
        Spacer(1, 2),
        Paragraph("ACR-[YYYY]-[ROLE]-[HEX]<br/>e.g. ACR-2026-FUL-5399C8", body_style_diag)
    ]
    c2 = [
        Paragraph("<b>SHA-256 Hash Digest</b>", title_style_purple),
        Spacer(1, 2),
        Paragraph("Cryptographic hash of CertID, UserID, Type & Timestamp.", body_style_diag)
    ]
    c3 = [
        Paragraph("<b>Dynamic QR Code</b>", title_style_green),
        Spacer(1, 2),
        Paragraph("Scannable URL targeting /verify?id=ACR-2026-...", body_style_diag)
    ]
    meta_t = Table([[c1, c2, c3]], colWidths=[w3, w3, w3])
    meta_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#eff6ff")),
        ('BOX', (0,0), (0,0), 1, colors.HexColor("#2563eb")),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#faf5ff")),
        ('BOX', (1,0), (1,0), 1, colors.HexColor("#9333ea")),
        ('BACKGROUND', (2,0), (2,0), colors.HexColor("#f0fdf4")),
        ('BOX', (2,0), (2,0), 1, colors.HexColor("#16a34a")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))

    a2 = make_arrow_down("ReportLab PDF Compilation & Public Verification Registration")
    b3 = make_box(
        Paragraph("3. Landscape PDF Credential & Public Third-Party Verification", title_style_green),
        Paragraph("ReportLab compiles an official landscape PDF certificate with golden borders, institution name, student full name, verification hash, and QR code. Inserts record into certificates table. Employers verify authenticity via public URL GET /api/certificates/verify/{id}.", body_style_diag),
        "#ecfdf5", "#059669"
    )
    return [b1, a1, meta_t, a2, b3]

# -------------------------------------------------------------
# FIG 6.9: Mentor and Governance Workflow
# -------------------------------------------------------------
def build_fig_6_9():
    b1 = make_box(
        Paragraph("1. Role-Based Access Control (RBAC) Guard", title_style_slate),
        Paragraph("Faculty mentor authenticates via JWT. Route dependency get_current_user verifies presence of 'mentor' or 'admin' role in user_roles table, denying unauthorized student access.", body_style_diag),
        "#f1f5f9", "#475569"
    )
    a1 = make_arrow_down("Authorized Mentor Session Established")
    b2 = make_box(
        Paragraph("2. Mentor Oversight & Cohort Analytics Dashboard", title_style_indigo),
        Paragraph("Displays aggregated cohort statistics: total active students, average assessment scores, and pending project submissions queue with GitHub repository links and student implementation notes.", body_style_diag),
        "#e0e7ff", "#4338ca"
    )
    a2 = make_arrow_down("Mentor Decision Action (Approve / Request Revision)")
    b3 = make_box(
        Paragraph("3. Evaluation Feedback, Roadmap Milestone Unlock & Audit Logging", title_style_green),
        Paragraph("Mentor submits evaluation and qualitative notes. Status updates to 'approved', automatically fulfilling the corresponding practical deliverable in student's roadmap. The action is logged to audit_logs for institutional compliance.", body_style_diag),
        "#dcfce7", "#15803d"
    )
    return [b1, a1, b2, a2, b3]

# -------------------------------------------------------------
# FIG 6.10: Overall Three-Tier System Architecture Block Diagram
# -------------------------------------------------------------
def build_fig_6_10():
    # Tier 1
    t1_header = Paragraph("<b>TIER 1: CLIENT PRESENTATION LAYER (Browser / Single Page Application)</b>", header_white_blue)
    t1_body = Paragraph(
        "• <b>Framework:</b> React 18 with TypeScript &amp; Vite Build Tooling<br/>"
        "• <b>Styling &amp; UX:</b> Tailwind CSS Utility Architecture with Lucide Icons &amp; Responsive Drawer Layouts<br/>"
        "• <b>Data Visualization:</b> Recharts SVG Library (Multi-Axis Polar Radar Mastery Charts &amp; Progress Bars)<br/>"
        "• <b>Routing &amp; State:</b> React Router DOM with Protected Route Guards &amp; Client Token Store",
        body_style_diag
    )
    t1 = Table([[t1_header], [t1_body]], colWidths=[TOTAL_W])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e40af")),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor("#eff6ff")),
        ('BOX', (0,0), (-1,-1), 1.25, colors.HexColor("#1e40af")),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))

    a1 = make_arrow_down("HTTPS / RESTful JSON Protocol (Bearer JWT Authentication)")

    # Tier 2
    t2_header = Paragraph("<b>TIER 2: APPLICATION SERVICE LAYER (FastAPI Web Framework / Python 3.13)</b>", header_white_indigo)
    t2_body = Paragraph(
        "• <b>API Controllers:</b> Domain-Driven Routes (/auth, /careers, /assessments, /skills, /roadmaps, /planner, /certificates)<br/>"
        "• <b>Validation:</b> Pydantic v2 Schemas with Custom Null-Sanitizing Pre-Validators to Prevent 500 Errors<br/>"
        "• <b>Security &amp; Proctoring:</b> Bcrypt Password Hashing, JWT Tokens, Server-Side Exam Grader &amp; Anti-Cheat Logger<br/>"
        "• <b>Core Algorithms:</b> Multi-Factor Career Matching, Mathematical Skill-Gap Quantification, Prerequisite DAG Sorter<br/>"
        "• <b>Document Compilation:</b> ReportLab PDF Generation Engine for Verifiable SHA-256 Credentials and Project Reports",
        body_style_diag
    )
    t2 = Table([[t2_header], [t2_body]], colWidths=[TOTAL_W])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#3730a3")),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor("#e0e7ff")),
        ('BOX', (0,0), (-1,-1), 1.25, colors.HexColor("#3730a3")),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))

    a2 = make_arrow_down("SQLAlchemy ORM Data Transactions &amp; Generative AI Service Calls")

    # Tier 3 (Split into Database and External AI)
    w_t3a = (TOTAL_W - 6) * 0.58
    w_t3b = (TOTAL_W - 6) * 0.42

    t3a_header = Paragraph("<b>TIER 3A: PERSISTENT DATABASE</b>", header_white_green)
    t3a_body = Paragraph(
        "<b>Relational DBMS (SQLite / PostgreSQL)</b><br/>"
        "• profiles (15 academic attributes)<br/>"
        "• user_roles (student, mentor, admin)<br/>"
        "• career_profiles &amp; requirements<br/>"
        "• assessment_questions &amp; attempts<br/>"
        "• skill_assessments (empirical baselines)<br/>"
        "• roadmaps &amp; roadmap_tasks (DAG states)<br/>"
        "• learning_resources &amp; project_submissions<br/>"
        "• certificates (SHA-256 validation records)<br/>"
        "• audit_logs (security telemetry events)",
        body_style_diag
    )
    t3a = Table([[t3a_header], [t3a_body]], colWidths=[w_t3a])
    t3a.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#166534")),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor("#f0fdf4")),
        ('BOX', (0,0), (-1,-1), 1.25, colors.HexColor("#166534")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))

    t3b_header = Paragraph("<b>TIER 3B: AI &amp; VERIFICATION SERVICES</b>", header_white_amber)
    t3b_body = Paragraph(
        "<b>Intelligence &amp; Trust Providers</b><br/>"
        "• <b>Google Gemini 2.5 API:</b><br/>"
        "  Generative curriculum synthesis with<br/>"
        "  strict ROADMAP_SCHEMA JSON validation.<br/>"
        "• <b>Deterministic Fallback:</b><br/>"
        "  Offline rule graph traversal.<br/>"
        "• <b>Public QR Verification:</b><br/>"
        "  External instant credential lookup.",
        body_style_diag
    )
    t3b = Table([[t3b_header], [t3b_body]], colWidths=[w_t3b])
    t3b.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#92400e")),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor("#fef3c7")),
        ('BOX', (0,0), (-1,-1), 1.25, colors.HexColor("#92400e")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))

    t3_row = Table([[t3a, t3b]], colWidths=[w_t3a, w_t3b])
    t3_row.setStyle(TableStyle([
        ('PADDING', (0,0), (-1,-1), 0),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))

    return [t1, a1, t2, a2, t3_row]

# -------------------------------------------------------------
# WORKFLOW 7.6: End-to-End System Workflow
# -------------------------------------------------------------
def build_workflow_7_6():
    steps = [
        ("Step 1: Student Registration & Authentication", "Student signs up with email/password; system issues secure JWT token and sets up student role.", "#eff6ff", "#2563eb"),
        ("Step 2: 15-Dimensional Profile Completion", "Student fills academic details, study hours, and 4-tier skills; system calculates completion % and seeds baselines.", "#f5f3ff", "#7c3aed"),
        ("Step 3: Multi-Factor Career Recommendation", "Engine calculates compatibility match percentages across 12 standardized career profiles.", "#fefce8", "#ca8a04"),
        ("Step 4: Timed Diagnostic Technical Assessment", "10 randomized questions with protected answer keys, 15-minute countdown, and optional proctoring.", "#ecfeff", "#0891b2"),
        ("Step 5: Evidence-Based Skill Gap Analysis", "Calculates empirical deficiency scores and renders multi-axis polar radar mastery visualization.", "#fffbeb", "#d97706"),
        ("Step 6: Dual-Engine Roadmap Generation", "Synthesizes multi-stage curriculum via Gemini AI or deterministic fallback with Stage 1 unlocked.", "#e0e7ff", "#4338ca"),
        ("Step 7: 7-Day Weekly Study Planner", "Distributes open tasks across Monday-Sunday calendar matching daily available study budget.", "#fdf4ff", "#c026d3"),
        ("Step 8: Practical Capstone Projects", "Student builds code, pushes to GitHub, and submits repository URL for faculty review.", "#f0fdf4", "#16a34a"),
        ("Step 9: Verifiable PDF Certification", "System verifies eligibility and issues landscape PDF certificate with SHA-256 hash and dynamic QR code.", "#ecfdf5", "#059669"),
    ]
    flow_items = []
    for idx, (title, desc, bg, border) in enumerate(steps):
        b = make_box(Paragraph(f"<b>{title}</b>", ParagraphStyle('WFT', fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=colors.HexColor(border))),
                     Paragraph(desc, body_style_diag), bg, border)
        flow_items.append(b)
        if idx < len(steps) - 1:
            flow_items.append(make_arrow_down())
    return flow_items
