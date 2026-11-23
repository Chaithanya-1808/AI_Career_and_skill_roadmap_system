# -*- coding: utf-8 -*-
import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import diagram_builders

class NumberedDiagramCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedDiagramCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedDiagramCanvas, self).showPage()
        super(NumberedDiagramCanvas, self).save()

    def draw_page_decorations(self, total_pages):
        if self._pageNumber == 1:
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#334155"))

        # Header
        self.drawString(54, A4[1] - 36, "AI Career & Smart Roadmap System – System Architecture & Design Diagrams")
        self.drawRightString(A4[0] - 54, A4[1] - 36, "Dept. of CSE, NCET")
        self.setStrokeColor(colors.HexColor("#94a3b8"))
        self.setLineWidth(0.75)
        self.line(54, A4[1] - 40, A4[0] - 54, A4[1] - 40)

        # Footer
        self.line(54, 46, A4[0] - 54, 46)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(54, 32, "Dept. of CSE, NCET")
        self.drawCentredString(A4[0] / 2.0, 32, "2025-26")
        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(A4[0] - 54, 32, page_str)
        self.restoreState()

def build_diagrams_pdf():
    output_filename = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "AI_CareerPath_System_Architecture_and_Design_Diagrams.pdf"))
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'CoverTitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=22, leading=28,
        alignment=TA_CENTER, textColor=colors.HexColor("#0f172a")
    )
    subtitle_style = ParagraphStyle(
        'CoverSubtitle', parent=styles['Normal'],
        fontName='Helvetica', fontSize=12, leading=16,
        alignment=TA_CENTER, textColor=colors.HexColor("#2563eb")
    )
    dept_style = ParagraphStyle(
        'CoverDept', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=11, leading=15,
        alignment=TA_CENTER, textColor=colors.HexColor("#1e293b")
    )
    meta_style = ParagraphStyle(
        'CoverMeta', parent=styles['Normal'],
        fontName='Helvetica', fontSize=10, leading=14,
        alignment=TA_CENTER, textColor=colors.HexColor("#475569")
    )
    chap_title_style = ParagraphStyle(
        'ChapTitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=15, leading=19,
        alignment=TA_LEFT, textColor=colors.HexColor("#0f172a"),
        spaceAfter=10
    )
    sec_title_style = ParagraphStyle(
        'SecTitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=11, leading=15,
        textColor=colors.HexColor("#1e3a8a"),
        spaceBefore=6, spaceAfter=4
    )
    body_style = ParagraphStyle(
        'Body', parent=styles['Normal'],
        fontName='Helvetica', fontSize=9, leading=13,
        alignment=TA_JUSTIFY, textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )
    caption_style = ParagraphStyle(
        'Caption', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=9, leading=12,
        alignment=TA_CENTER, textColor=colors.HexColor("#1d4ed8"),
        spaceBefore=6, spaceAfter=14
    )

    story = []

    # ========================== COVER PAGE ==========================
    story.append(Spacer(1, 40))
    story.append(Paragraph("SYSTEM DESIGN &amp; ARCHITECTURE DIAGRAMS BOOKLET", meta_style))
    story.append(Spacer(1, 14))
    story.append(Paragraph("AI CAREER &amp; SMART ROADMAP SYSTEM FOR STUDENTS (AI CAREERPATH)", title_style))
    story.append(Spacer(1, 12))
    story.append(Paragraph("Comprehensive Visual Flowcharts, Data Flow Architectures, and Multi-Tier Component Specifications", subtitle_style))
    story.append(Spacer(1, 45))

    story.append(Paragraph("Submitted by:", dept_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>CHAITHANYA C</b> (1NC24CS034)<br/>3rd Year, Computer Science &amp; Engineering", meta_style))
    story.append(Spacer(1, 45))

    story.append(HRFlowable(width="60%", thickness=1.5, color=colors.HexColor("#2563eb"), spaceAfter=15))
    story.append(Paragraph("<b>DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING</b>", dept_style))
    story.append(Paragraph("<b>NAGARJUNA COLLEGE OF ENGINEERING AND TECHNOLOGY</b>", dept_style))
    story.append(Paragraph("(An Autonomous Institution affiliated to VTU, Belagavi, Accredited by NAAC with 'A+' Grade)", meta_style))
    story.append(Paragraph("Bengaluru – 562164, Karnataka, India", meta_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>ACADEMIC YEAR: 2025 – 2026</b>", dept_style))
    story.append(PageBreak())

    # ========================== LIST OF FIGURES ==========================
    story.append(Paragraph("TABLE OF FIGURES &amp; ARCHITECTURAL DIAGRAMS", chap_title_style))
    story.append(Paragraph("The diagrams below represent the end-to-end design and implementation of the AI CareerPath platform. Each figure illustrates data flow, component interactions, and state persistence across client, server, and storage layers:", body_style))
    story.append(Spacer(1, 6))

    lof_data = [
        [Paragraph("<b>Fig #</b>", styles['Normal']), Paragraph("<b>Figure Name / Title</b>", styles['Normal']), Paragraph("<b>Module / Domain</b>", styles['Normal'])],
        [Paragraph("<b>Fig 6.1</b>", styles['Normal']), Paragraph("Student Profile Management Workflow", styles['Normal']), Paragraph("Chapter 6: Module 6.1", styles['Normal'])],
        [Paragraph("<b>Fig 6.2</b>", styles['Normal']), Paragraph("Career Recommendation Engine Architecture", styles['Normal']), Paragraph("Chapter 6: Module 6.2", styles['Normal'])],
        [Paragraph("<b>Fig 6.3</b>", styles['Normal']), Paragraph("Diagnostic Assessment &amp; Anti-Cheat Workflow", styles['Normal']), Paragraph("Chapter 6: Module 6.3", styles['Normal'])],
        [Paragraph("<b>Fig 6.4</b>", styles['Normal']), Paragraph("Evidence-Based Skill Gap Analysis Architecture", styles['Normal']), Paragraph("Chapter 6: Module 6.4", styles['Normal'])],
        [Paragraph("<b>Fig 6.5</b>", styles['Normal']), Paragraph("Dual-Engine Learning Roadmap Generation Flow", styles['Normal']), Paragraph("Chapter 6: Module 6.5", styles['Normal'])],
        [Paragraph("<b>Fig 6.6</b>", styles['Normal']), Paragraph("Curated Resources &amp; Project Submission Lifecycle", styles['Normal']), Paragraph("Chapter 6: Module 6.6", styles['Normal'])],
        [Paragraph("<b>Fig 6.7</b>", styles['Normal']), Paragraph("Student Progress Tracking &amp; Weekly Study Planner", styles['Normal']), Paragraph("Chapter 6: Module 6.7", styles['Normal'])],
        [Paragraph("<b>Fig 6.8</b>", styles['Normal']), Paragraph("Verifiable Certificate Issuance &amp; QR Verification", styles['Normal']), Paragraph("Chapter 6: Module 6.8", styles['Normal'])],
        [Paragraph("<b>Fig 6.9</b>", styles['Normal']), Paragraph("Mentor Governance &amp; Institutional Review Workflow", styles['Normal']), Paragraph("Chapter 6: Module 6.9", styles['Normal'])],
        [Paragraph("<b>Fig 6.10</b>", styles['Normal']), Paragraph("Overall Three-Tier System Architecture Block Diagram", styles['Normal']), Paragraph("Chapter 6: Section 6.10", styles['Normal'])],
        [Paragraph("<b>Fig 7.1</b>", styles['Normal']), Paragraph("Overall End-to-End System Execution Pipeline", styles['Normal']), Paragraph("Chapter 7: Section 7.6", styles['Normal'])],
        [Paragraph("<b>Appendix B</b>", styles['Normal']), Paragraph("System User Interface Snapshots Catalog (12 Screens)", styles['Normal']), Paragraph("Appendix B", styles['Normal'])],
    ]
    lof_table = Table(lof_data, colWidths=[65, 270, 150])
    lof_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(lof_table)
    story.append(PageBreak())

    # ========================== CHAPTER 6 DIAGRAMS ==========================
    diagrams_info = [
        ("Fig 6.1: Student Profile Management Workflow",
         "Captures, validates, and persists 15 student academic dimensions. Calculates mathematical completion percentage, maps weekly study hours, and seeds initial self-reported skill baselines in the database.",
         diagram_builders.build_fig_6_1),

        ("Fig 6.2: Career Recommendation Engine Architecture",
         "Executes multi-factor proficiency-weighted matching. Evaluates technical skills (+12/+9/+6/+4), interest alignment (+15), target preference (+25), and branch affinity (+10) to compute normalized career compatibility.",
         diagram_builders.build_fig_6_2),

        ("Fig 6.3: Diagnostic Assessment & Integrity Workflow",
         "Provides randomized 10-question technical tests with server-evaluated answer keys. Enforces a 15-minute countdown clock, voluntary camera monitoring, and tab-switch integrity event logging.",
         diagram_builders.build_fig_6_3),

        ("Fig 6.4: Evidence-Based Skill Gap Analysis Architecture",
         "Quantifies the mathematical deficit between assessed student skills and career benchmark requirements. Calculates weighted delta scores and prepares Recharts polar radar chart datasets.",
         diagram_builders.build_fig_6_4),

        ("Fig 6.5: Dual-Engine Learning Roadmap Generation Flow",
         "Dual-engine architecture synthesizing personalized learning paths. Employs Google Gemini API with strict JSON schema enforcement when online, with seamless fallback to an offline deterministic prerequisite graph.",
         diagram_builders.build_fig_6_5),

        ("Fig 6.6: Resources and Project Submission Lifecycle",
         "Connects curated technical documentation with practical capstone project specifications. Tracks student GitHub repository submissions and manages faculty mentor evaluation workflows.",
         diagram_builders.build_fig_6_6),

        ("Fig 6.7: Progress Tracking & Weekly Study Planner Flow",
         "Distributes active roadmap tasks across a 7-day schedule to match daily study hour targets. Verifies prerequisite task dependencies, cascades status updates, and computes completion velocity.",
         diagram_builders.build_fig_6_7),

        ("Fig 6.8: Certificate Issuance and Verification Architecture",
         "Evaluates achievement eligibility, compiles landscape PDF credentials via ReportLab, embeds SHA-256 cryptographic verification hashes and dynamic QR codes, and provides a public verification endpoint.",
         diagram_builders.build_fig_6_8),

        ("Fig 6.9: Mentor Governance & Institutional Review Workflow",
         "Provides faculty mentors with role-based dashboard access to review student project deliverables, submit qualitative feedback, and maintain question banks while logging actions to audit trails.",
         diagram_builders.build_fig_6_9),
    ]

    for title, desc, builder in diagrams_info:
        story.append(Paragraph(title, sec_title_style))
        story.append(Paragraph(desc, body_style))
        story.append(Spacer(1, 4))
        dflow = builder()
        dflow.append(Spacer(1, 4))
        dflow.append(Paragraph(f"<b>{title}</b>", caption_style))
        story.extend(dflow)
        story.append(PageBreak())

    # Fig 6.10 on dedicated page
    story.append(Paragraph("Fig 6.10: Overall Three-Tier System Architecture Block Diagram", sec_title_style))
    story.append(Paragraph(
        "Decomposes the platform into Client Presentation (React 18 / Vite / TypeScript), Application Service Layer (FastAPI / Python 3.13), Persistent Database Storage (SQLite / PostgreSQL), and External AI & Verification Services (Google Gemini / QR Endpoint):",
        body_style
    ))
    story.append(Spacer(1, 4))
    f10 = diagram_builders.build_fig_6_10()
    f10.append(Spacer(1, 4))
    f10.append(Paragraph("<b>Fig 6.10: Overall Three-Tier System Architecture (Client Presentation Tier &lt;-- HTTPS/JSON --&gt; FastAPI Application Tier &lt;-- ORM / API --&gt; Relational Database &amp; Gemini AI Services)</b>", caption_style))
    story.extend(f10)
    story.append(PageBreak())

    # Fig 7.1 Workflow on dedicated page
    story.append(Paragraph("Fig 7.1: Overall End-to-End System Execution Pipeline", sec_title_style))
    story.append(Paragraph(
        "Illustrates the complete end-to-end student journey from account registration and profile completion to career matching, timed diagnostic assessment, skill gap quantification, adaptive roadmap synthesis, weekly planning, and verifiable certification:",
        body_style
    ))
    story.append(Spacer(1, 4))
    wf = diagram_builders.build_workflow_7_6()
    wf.append(Spacer(1, 4))
    wf.append(Paragraph("<b>Fig 7.1: Overall End-to-End System Workflow Execution Pipeline</b>", caption_style))
    story.extend(wf)
    story.append(PageBreak())

    # Appendix B Snapshots
    story.append(Paragraph("APPENDIX B: SYSTEM USER INTERFACE SNAPSHOTS CATALOG", chap_title_style))
    story.append(Paragraph("The following cards catalogue the twelve primary visual screens of the AI CareerPath platform:", body_style))
    story.append(Spacer(1, 6))

    snapshots = [
        ("Snapshot B.1 – Public Landing Page & Demo Portal", "Displays the hero header, core platform highlights, and one-click demo access button configured for student Chaithanya (3rd Year CSE)."),
        ("Snapshot B.2 – Student Registration & Authentication Modal", "Displays secure sign-up and sign-in dialogs implementing bcrypt encryption, JWT token exchange, and validation error alerting."),
        ("Snapshot B.3 – Student Academic Profile Management View", "Displays the comprehensive 15-field profile editor, multi-select tag inputs, daily study hours slider, and real-time profile completion percentage indicator bar."),
        ("Snapshot B.4 – Dashboard Overview View", "Central hub showcasing personalized welcome greetings, roadmap progress percentage, tasks completed counter, weekly study target, overall career match score, and next recommended learning actions."),
        ("Snapshot B.5 – Career Explorer & Recommendation View", "Displays interactive career role cards, salary expectations, prerequisite listings, and computed match percentages based on student competencies."),
        ("Snapshot B.6 – Timed Diagnostic Assessment Room", "Features the 15-minute countdown clock, voluntary camera monitoring toggle, question navigation palette, code snippet displays, and option selectors."),
        ("Snapshot B.7 – Diagnostic Score Report & Question Review", "Displays the student's evaluated percentage, correct vs. incorrect breakdown, category mastery analysis, and per-question technical explanations."),
        ("Snapshot B.8 – Skill Gap Analysis & Multi-Axis Radar Visualization", "Renders the Recharts polar radar chart contrasting assessed proficiency against career benchmarks, accompanied by prioritized deficiency badges."),
        ("Snapshot B.9 – Prerequisite-Aware Learning Roadmap View", "Displays the stage-by-stage learning curriculum, prerequisite task status indicators (locked, available, in_progress, completed), and deliverable upload links."),
        ("Snapshot B.10 – Weekly Study Planner Agenda", "Displays the 7-day calendar allocating open tasks to meet daily study hour targets with time tracking buttons."),
        ("Snapshot B.11 – Curated Learning Resources & Capstone Project Repository", "Displays filterable technical documentation links, video tutorials, and structured project specifications with milestone checklists."),
        ("Snapshot B.12 – Verifiable Certificate Generation & Public Verification Portal", "Displays the generated PDF certificate with embedded SHA-256 verification hash, dynamic QR code, and the public lookup endpoint confirming student achievement.")
    ]

    for snap_title, snap_desc in snapshots:
        card = Table([
            [Paragraph(f"<b>{snap_title}</b>", ParagraphStyle('SnapTitle', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=colors.HexColor("#1e3a8a")))],
            [Paragraph(snap_desc, ParagraphStyle('SnapDesc', fontName='Helvetica', fontSize=8, leading=10.5, textColor=colors.HexColor("#334155")))]
        ], colWidths=[A4[0] - 108])
        card.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#eff6ff")),
            ('BACKGROUND', (0,1), (-1,1), colors.HexColor("#f8fafc")),
            ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#93c5fd")),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(card)
        story.append(Spacer(1, 4))

    doc.build(story, canvasmaker=NumberedDiagramCanvas)
    print(f"DIAGRAMS_BOOKLET_GENERATED_SUCCESSFULLY: {output_filename}")

if __name__ == "__main__":
    build_diagrams_pdf()
