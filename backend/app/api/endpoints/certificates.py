import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user
from app.models.models import Certificate, User
from app.schemas.schemas import (
    CertificateOut, CertificateVerifyOut, CertificateGenerateRequest
)
from app.services.certificate_service import (
    issue_certificate, CERTIFICATES_DIR, check_eligibility
)

router = APIRouter()

@router.post("/claim", response_model=CertificateOut)
def claim_certificate(
    req: CertificateGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        cert = issue_certificate(
            db=db,
            user=current_user,
            achievement_type=req.achievement_type,
            career_id=req.career_id or current_user.target_job_role or "full-stack-developer"
        )
        download_url = f"{settings.API_V1_STR}/certificates/download/{cert.pdf_filename}"
        verif_url = f"{settings.CERTIFICATE_VERIFICATION_BASE_URL}/{cert.certificate_id}"

        return CertificateOut(
            id=cert.id,
            certificate_id=cert.certificate_id,
            student_name=cert.student_name,
            achievement_type=cert.achievement_type,
            title=cert.title,
            career_title=cert.career_title,
            criteria_summary=cert.criteria_summary,
            issued_at=cert.issued_at,
            verification_hash=cert.verification_hash,
            verification_url=verif_url,
            is_revoked=cert.is_revoked,
            pdf_download_url=download_url
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/my", response_model=List[CertificateOut])
def get_my_certificates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    certs = db.query(Certificate).filter(
        Certificate.user_id == current_user.id,
        Certificate.is_revoked == False
    ).order_by(Certificate.issued_at.desc()).all()

    out = []
    for c in certs:
        download_url = f"{settings.API_V1_STR}/certificates/download/{c.pdf_filename}"
        verif_url = f"{settings.CERTIFICATE_VERIFICATION_BASE_URL}/{c.certificate_id}"
        out.append(
            CertificateOut(
                id=c.id,
                certificate_id=c.certificate_id,
                student_name=c.student_name,
                achievement_type=c.achievement_type,
                title=c.title,
                career_title=c.career_title,
                criteria_summary=c.criteria_summary,
                issued_at=c.issued_at,
                verification_hash=c.verification_hash,
                verification_url=verif_url,
                is_revoked=c.is_revoked,
                pdf_download_url=download_url
            )
        )
    return out

@router.get("/download/{filename}")
def download_certificate_pdf(filename: str):
    # Prevent path traversal
    safe_filename = os.path.basename(filename)
    filepath = os.path.join(CERTIFICATES_DIR, safe_filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Certificate PDF not found on server")

    return FileResponse(
        filepath,
        media_type="application/pdf",
        filename=safe_filename
    )

@router.get("/verify/{certificate_id}", response_model=CertificateVerifyOut)
def verify_certificate(certificate_id: str, db: Session = Depends(get_db)):
    """
    PUBLIC endpoint. Allows employers, mentors, or academic evaluators to verify a certificate.
    """
    cert = db.query(Certificate).filter(
        Certificate.certificate_id == certificate_id.strip()
    ).first()

    if not cert:
        raise HTTPException(status_code=404, detail="Invalid certificate ID. Record not found.")

    if cert.is_revoked:
        raise HTTPException(status_code=410, detail="This certificate has been revoked by an administrator.")

    return CertificateVerifyOut(
        certificate_id=cert.certificate_id,
        is_valid=True,
        student_name=cert.student_name,
        achievement_title=cert.title,
        career_title=cert.career_title,
        issued_at=cert.issued_at,
        criteria_summary=cert.criteria_summary,
        platform_name="AI Career & Smart Roadmap System",
        scope_disclaimer="Verified against server-recorded student milestone completion. Non-accredited college portfolio credential."
    )

