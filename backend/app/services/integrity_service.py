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

    is_flagged = (tab_switches >= 3) or (fullscreen_exits >= 3) or (window_blurs >= 5)
    new_status = "flagged" if is_flagged else "clean"

    attempt.integrity_status = new_status
    attempt.integrity_summary = {
        "total_events": len(events),
        "tab_switches": tab_switches,
        "window_blurs": window_blurs,
        "fullscreen_exits": fullscreen_exits,
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "review_recommendation": "Manual mentor review recommended due to window focus changes." if is_flagged else "Assessment completed within standard integrity parameters."
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

