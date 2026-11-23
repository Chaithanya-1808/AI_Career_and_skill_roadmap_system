from typing import Dict, Any, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.models import AssessmentAttempt, AssessmentIntegrityEvent

def record_integrity_event(
    db: Session,
    attempt_id: str,
    event_type: str,
    details: Dict[str, Any]
) -> AssessmentIntegrityEvent:
    """
    Persists an integrity signal during monitored or standard assessments.
    Signals are recorded for human faculty review, not automated punishment.
    """
    event = AssessmentIntegrityEvent(
        attempt_id=attempt_id,
        event_type=event_type,
        event_timestamp=datetime.now(timezone.utc),
        details=details or {}
    )
    db.add(event)
    db.commit()

    # Check cumulative events and flag if threshold exceeded
    evaluate_attempt_integrity(db, attempt_id)
    return event

def evaluate_attempt_integrity(db: Session, attempt_id: str) -> str:
    attempt = db.query(AssessmentAttempt).filter(AssessmentAttempt.id == attempt_id).first()
    if not attempt:
        return "clean"

    events = db.query(AssessmentIntegrityEvent).filter(
        AssessmentIntegrityEvent.attempt_id == attempt_id
    ).all()

    tab_switches = sum(1 for e in events if e.event_type == "tab_switch")
    window_blurs = sum(1 for e in events if e.event_type == "window_blur")
    fullscreen_exits = sum(1 for e in events if e.event_type == "fullscreen_exit")
    camera_occlusions = sum(1 for e in events if e.event_type in ("camera_occlusion", "camera_tamper", "camera_disconnected"))
    malpractice_attempts = sum(1 for e in events if e.event_type in ("mobile_usage_detected", "copy_paste_attempt"))

    is_flagged = (tab_switches >= 2) or (fullscreen_exits >= 2) or (window_blurs >= 3) or (camera_occlusions >= 1) or (malpractice_attempts >= 1)
    new_status = "flagged" if is_flagged else "clean"

    reasons = []
    if camera_occlusions > 0:
        reasons.append(f"Camera lens covered or obstructed {camera_occlusions} time(s)")
    if malpractice_attempts > 0:
        reasons.append(f"Suspicious activity / copy-paste detected {malpractice_attempts} time(s)")
    if tab_switches > 0:
        reasons.append(f"Tab switch detected {tab_switches} time(s)")
    if window_blurs > 0:
        reasons.append(f"Focus deviation (second screen / app switch) detected {window_blurs} time(s)")

    attempt.integrity_status = new_status
    attempt.integrity_summary = {
        "total_events": len(events),
        "tab_switches": tab_switches,
        "window_blurs": window_blurs,
        "fullscreen_exits": fullscreen_exits,
        "camera_occlusions": camera_occlusions,
        "malpractice_attempts": malpractice_attempts,
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "review_recommendation": f"Malpractice signals detected: {'; '.join(reasons)}." if is_flagged else "Assessment completed within verified integrity parameters."
    }
    db.commit()
    return new_status

def get_integrity_report(db: Session, attempt_id: str) -> Dict[str, Any]:
    attempt = db.query(AssessmentAttempt).filter(AssessmentAttempt.id == attempt_id).first()
    if not attempt:
        raise ValueError("Assessment attempt not found")

    events = db.query(AssessmentIntegrityEvent).filter(
        AssessmentIntegrityEvent.attempt_id == attempt_id
    ).order_by(AssessmentIntegrityEvent.event_timestamp.asc()).all()

    tab_switches = sum(1 for e in events if e.event_type == "tab_switch")
    window_blurs = sum(1 for e in events if e.event_type == "window_blur")
    fullscreen_exits = sum(1 for e in events if e.event_type == "fullscreen_exit")
    camera_disconnects = sum(1 for e in events if e.event_type in ("camera_permission_denied", "camera_disconnected"))

    timeline = [
        {
            "id": e.id,
            "event_type": e.event_type,
            "timestamp": e.event_timestamp.isoformat(),
            "details": e.details
        }
        for e in events
    ]

    return {
        "attempt_id": attempt.id,
        "camera_monitoring_enabled": attempt.camera_monitoring_enabled,
        "total_events": len(events),
        "tab_switches": tab_switches,
        "window_blurs": window_blurs,
        "fullscreen_exits": fullscreen_exits,
        "camera_disconnects": camera_disconnects,
        "integrity_status": attempt.integrity_status,
        "notes": attempt.integrity_summary.get("review_recommendation", "Standard monitoring recorded."),
        "timeline": timeline
    }

