import os
import json
import logging
from typing import Dict, List, Any, Tuple, Optional
from app.core.config import settings
from app.models.models import User, CareerProfile

logger = logging.getLogger(__name__)

ROADMAP_SCHEMA = {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "stage_number": {"type": "integer"},
            "stage_title": {"type": "string"},
            "tasks": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "title": {"type": "string"},
                        "skill_category": {"type": "string"},
                        "description": {"type": "string"},
                        "learning_objectives": {"type": "array", "items": {"type": "string"}},
                        "recommendation_reason": {"type": "string"},
                        "prerequisite_task_ids": {"type": "array", "items": {"type": "string"}},
                        "estimated_hours": {"type": "integer"},
                        "resources": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "title": {"type": "string"},
                                    "url": {"type": "string"}
                                },
                                "required": ["title", "url"]
                            }
                        },
                        "practical_exercises": {"type": "array", "items": {"type": "string"}},
                        "deliverable": {"type": "string"},
                        "validation_quiz_id": {"type": "string"},
                        "priority": {"type": "string", "enum": ["critical", "high", "medium", "optional"]},
                        "target_week": {"type": "integer"}
                    },
                    "required": ["id", "title", "skill_category", "description", "estimated_hours", "deliverable"]
                }
            }
        },
        "required": ["stage_number", "stage_title", "tasks"]
    }
}

def try_generate_ai_roadmap(
    user: User,
    career: CareerProfile,
    weekly_hours: int,
    timeline_weeks: int,
    gap_report: Dict[str, Any]
) -> Tuple[Optional[List[Dict[str, Any]]], bool, str]:
    """
    Attempts to generate a personalized roadmap using Google Gemini API.
    If GEMINI_API_KEY is not configured or an error occurs, fails gracefully to the rule engine.
    """
    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
    if not api_key or api_key.strip() == "" or api_key == "placeholder_key":
        logger.info("GEMINI_API_KEY not configured. Using deterministic fallback engine.")
        return None, False, "Fallback Rule Engine"

    try:
        from google import genai
        client = genai.Client(api_key=api_key)

        missing_skills_str = ", ".join(s["skill_name"] for s in gap_report.get("recommended_priority_skills", []))
        strong_skills_str = ", ".join(s["skill_name"] for s in gap_report.get("strong_skills", []))

        prompt = f"""
You are an expert AI Career and Curriculum Architect.
Generate a structured, personalized, prerequisite-ordered learning roadmap for a student.

Student Profile:
- Name: {user.full_name}
- Academic Level: {user.qualification or 'College Student'}, Semester: {user.current_semester or 'Year 2'}
- Target Career: {career.title}
- Available Study Time: {weekly_hours} hours per week
- Target Timeline: {timeline_weeks} weeks
- Verified Existing Strengths: {strong_skills_str or 'None assessed yet'}
- Priority Skill Gaps to Bridge: {missing_skills_str or 'All foundational skills'}
- Preferred Learning Format: {user.preferred_learning_format or 'Interactive & Practical'}

Instructions:
1. Divide the roadmap into 4 to 6 logical learning stages.
2. In Stage 1, cover prerequisite foundations that are currently missing.
3. Ensure tasks have clear prerequisite dependencies, realistic hour estimates adhering to the student's {weekly_hours} hours/week budget, verifiable practical exercises, and tangible deliverables.
4. Output ONLY valid JSON adhering strictly to the schema provided. Do not invent non-existent URLs.
"""
        response = client.models.generate_content(
            model=settings.AI_MODEL,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": ROADMAP_SCHEMA
            }
        )

        if response and response.text:
            parsed_data = json.loads(response.text)
            if isinstance(parsed_data, list) and len(parsed_data) > 0:
                return parsed_data, True, settings.AI_MODEL

    except Exception as e:
        logger.warning(f"Google Gemini generation call failed: {str(e)}. Defaulting to fallback engine.")

    return None, False, "Fallback Rule Engine"

