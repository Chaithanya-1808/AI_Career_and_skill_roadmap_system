import os
import uuid
import hashlib
from datetime import datetime, timezone
from typing import Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import (
    Certificate, User, AssessmentAttempt, Roadmap, ProjectSubmission
)

# PDF Generation imports
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import qrcode
from io import BytesIO

CERTIFICATES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static", "certificates")
os.makedirs(CERTIFICATES_DIR, exist_ok=True)

def check_eligibility(
    db: Session,
    user: User,
    achievement_type: str,
    career_id: Optional[str] = None
) -> Tuple[bool, str, str, str]:
    """
    Validates server-side whether a student genuinely satisfies criteria for a certificate.
    Returns: (is_eligible, title, career_title, criteria_summary)
    """
    if achievement_type == "diagnostic_distinction":
        # Check if student scored >= 70% in an assessment
        attempt = db.query(AssessmentAttempt).filter(
            AssessmentAttempt.user_id == user.id,
            AssessmentAttempt.status == "submitted",
            AssessmentAttempt.score_percentage >= 70.0
        ).order_by(AssessmentAttempt.score_percentage.desc()).first()

        if not attempt:
            return False, "", "", "Requires scoring at least 70% in a verified diagnostic assessment."
        
        career_title = attempt.title.replace("Diagnostic Assessment: ", "") if attempt.title else "Full-Stack Development"
        return (
            True,
            f"Diagnostic Distinction in {career_title}",
            career_title,
            f"Achieved {attempt.score_percentage}% in server-scored diagnostic examination on {attempt.submitted_at.strftime('%Y-%m-%d')}."
        )

    elif achievement_type == "stage_completion":
        # Check if student completed at least Stage 1 of their roadmap
        roadmap = db.query(Roadmap).filter(
            Roadmap.user_id == user.id,
            Roadmap.status.in_(["active", "completed"])
        ).first()

        if not roadmap:
            return False, "", "", "No active roadmap found."

        stage_1_tasks = [t for t in roadmap.tasks if t.stage_number == 1]
        completed_stage_1 = [t for t in stage_1_tasks if t.status == "completed"]

        if len(stage_1_tasks) == 0 or len(completed_stage_1) < len(stage_1_tasks):
            return False, "", "", f"Requires completing all Stage 1 foundational tasks ({len(completed_stage_1)}/{len(stage_1_tasks)} completed)."

        return (
            True,
            f"Foundations Mastery: {roadmap.title.replace('Personalized Roadmap: ', '')}",
            roadmap.career_id.replace("-", " ").title(),
            f"Completed all mandatory Stage 1 foundation tasks and milestones."
        )

    elif achievement_type == "full_roadmap":
        roadmap = db.query(Roadmap).filter(
            Roadmap.user_id == user.id,
            Roadmap.status.in_(["active", "completed"])
        ).first()

        if not roadmap or roadmap.overall_progress_percentage < 80.0:
            current_pct = roadmap.overall_progress_percentage if roadmap else 0.0
            return False, "", "", f"Requires completing at least 80% of total roadmap tasks (current: {current_pct}%)."

        return (
            True,
            f"Full Career Track Milestone: {roadmap.title.replace('Personalized Roadmap: ', '')}",
            roadmap.career_id.replace("-", " ").title(),
            f"Successfully achieved {roadmap.overall_progress_percentage}% verified roadmap milestone completion."
        )

    return False, "", "", "Unknown achievement type"

def generate_certificate_id(achievement_type: str, career_id: str = "GEN") -> str:
    clean_career = (career_id or "GEN")[:3].upper()
    rand_hex = uuid.uuid4().hex[:6].upper()
    year = datetime.now().year
    return f"ACR-{year}-{clean_career}-{rand_hex}"

def issue_certificate(
    db: Session,
    user: User,
    achievement_type: str,
    career_id: Optional[str] = None
) -> Certificate:
    """
    Issues a verified certificate with server-side validation and generates a professional PDF.
    """
    is_eligible, title, career_title, criteria_summary = check_eligibility(db, user, achievement_type, career_id)
    if not is_eligible:
        raise ValueError(criteria_summary)

    # Check for existing certificate for this exact achievement type to avoid duplicate issuance
    existing = db.query(Certificate).filter(
        Certificate.user_id == user.id,
        Certificate.achievement_type == achievement_type,
        Certificate.is_revoked == False
    ).first()

    if existing:
        return existing

    cert_id = generate_certificate_id(achievement_type, career_id or "FSD")
    verification_secret = f"{user.id}:{cert_id}:{datetime.now().isoformat()}"
    verification_hash = hashlib.sha256(verification_secret.encode()).hexdigest()
    verification_url = f"{settings.CERTIFICATE_VERIFICATION_BASE_URL}/{cert_id}"

    # Generate PDF
    pdf_filename = f"{cert_id}.pdf"
    pdf_filepath = os.path.join(CERTIFICATES_DIR, pdf_filename)
    create_certificate_pdf(
        filepath=pdf_filepath,
        cert_id=cert_id,
        student_name=user.full_name,
        title=title,
        career_title=career_title,
        criteria_summary=criteria_summary,
        issue_date=datetime.now().strftime("%B %d, %Y"),
        verification_url=verification_url
    )

    cert = Certificate(
        certificate_id=cert_id,
        user_id=user.id,
        student_name=user.full_name,
        achievement_type=achievement_type,
        title=title,
        career_title=career_title,
        criteria_summary=criteria_summary,
        issued_at=datetime.now(timezone.utc),
        verification_hash=verification_hash,
        is_revoked=False,
        pdf_filename=pdf_filename
    )
    db.add(cert)
    db.commit()
    return cert

def create_certificate_pdf(
    filepath: str,
    cert_id: str,
    student_name: str,
    title: str,
    career_title: str,
    criteria_summary: str,
    issue_date: str,
    verification_url: str
):
    """
    Generates a formal, beautiful landscape PDF certificate using ReportLab.
    """
    doc = SimpleDocTemplate(
        filepath,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Styles
    brand_blue = colors.HexColor("#1e40af")
    slate_dark = colors.HexColor("#0f172a")
    slate_muted = colors.HexColor("#475569")
    gold_accent = colors.HexColor("#d97706")

    header_style = ParagraphStyle(
        'CertHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=brand_blue,
        alignment=1
    )
    
    sub_header_style = ParagraphStyle(
        'CertSubHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=gold_accent,
        alignment=1
    )

    presented_style = ParagraphStyle(
        'CertPresented',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=slate_muted,
        alignment=1
    )

    name_style = ParagraphStyle(
        'CertName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=32,
        textColor=slate_dark,
        alignment=1
    )

    title_style = ParagraphStyle(
        'CertTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=brand_blue,
        alignment=1
    )

    criteria_style = ParagraphStyle(
        'CertCriteria',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=slate_muted,
        alignment=1
    )

    footer_style = ParagraphStyle(
        'CertFooter',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#94a3b8"),
        alignment=1
    )

    # Generate QR Code image in memory
    qr = qrcode.QRCode(version=1, box_size=3, border=1)
    qr.add_data(verification_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    qr_buffer = BytesIO()
    qr_img.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)
    rl_qr = RLImage(qr_buffer, width=64, height=64)

    elements = [
        Spacer(1, 10),
        Paragraph("AI CAREER & SMART ROADMAP SYSTEM", header_style),
        Paragraph("VERIFIED ACADEMIC & SKILL ACHIEVEMENT", sub_header_style),
        Spacer(1, 20),
        Paragraph("THIS IS TO OFFICIALLY CERTIFY THAT", presented_style),
        Spacer(1, 10),
        Paragraph(student_name, name_style),
        Spacer(1, 15),
        Paragraph(f"has fulfilled the rigorous milestone criteria for", presented_style),
        Spacer(1, 8),
        Paragraph(title, title_style),
        Spacer(1, 12),
        Paragraph(criteria_summary, criteria_style),
        Spacer(1, 25),
    ]

    # Footer Table with Date, QR Code & Verification ID
    footer_data = [
        [
            Paragraph(f"<b>Issue Date:</b> {issue_date}<br/><b>Verification ID:</b> {cert_id}", criteria_style),
            rl_qr,
            Paragraph(f"<b>Scan to Verify:</b><br/>{verification_url}", criteria_style)
        ]
    ]
    footer_table = Table(footer_data, colWidths=[240, 90, 350])
    footer_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (1, 0), (1, 0), 'CENTER'),
    ]))
    elements.append(footer_table)
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("This certificate is issued based on server-verified milestone completion. Non-accredited college portfolio credential.", footer_style))

    doc.build(elements)

