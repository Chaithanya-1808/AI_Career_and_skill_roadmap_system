from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import LearningResource
from app.schemas.schemas import LearningResourceOut

router = APIRouter()

CURATED_DEFAULT_RESOURCES = [
    {
        "title": "MDN Web Docs: Learn HTML",
        "provider": "Mozilla Developer Network",
        "skill_id": "html-css",
        "career_id": "full-stack-developer",
        "difficulty": "beginner",
        "format": "documentation",
        "estimated_hours": 6,
        "is_free": True,
        "url": "https://developer.mozilla.org/en-US/docs/Learn/HTML",
        "recommended_stage": 1
    },
    {
        "title": "A Complete Guide to CSS Flexbox & Grid",
        "provider": "CSS Tricks",
        "skill_id": "html-css",
        "career_id": "full-stack-developer",
        "difficulty": "beginner",
        "format": "article",
        "estimated_hours": 4,
        "is_free": True,
        "url": "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
        "recommended_stage": 1
    },
    {
        "title": "Git Official Documentation & Pro Git Book",
        "provider": "Git SCM",
        "skill_id": "git-github",
        "career_id": "full-stack-developer",
        "difficulty": "beginner",
        "format": "documentation",
        "estimated_hours": 5,
        "is_free": True,
        "url": "https://git-scm.com/book/en/v2",
        "recommended_stage": 1
    },
    {
        "title": "The Modern JavaScript Tutorial",
        "provider": "JavaScript.info",
        "skill_id": "javascript",
        "career_id": "full-stack-developer",
        "difficulty": "intermediate",
        "format": "interactive",
        "estimated_hours": 12,
        "is_free": True,
        "url": "https://javascript.info/",
        "recommended_stage": 2
    },
    {
        "title": "React.dev Official Interactive Tutorial & Reference",
        "provider": "Meta / React Core Team",
        "skill_id": "react",
        "career_id": "full-stack-developer",
        "difficulty": "intermediate",
        "format": "interactive",
        "estimated_hours": 15,
        "is_free": True,
        "url": "https://react.dev/",
        "recommended_stage": 2
    },
    {
        "title": "Node.js & Express REST API Documentation",
        "provider": "Express.js Foundation",
        "skill_id": "nodejs-express",
        "career_id": "full-stack-developer",
        "difficulty": "intermediate",
        "format": "documentation",
        "estimated_hours": 10,
        "is_free": True,
        "url": "https://expressjs.com/en/starter/installing.html",
        "recommended_stage": 3
    },
    {
        "title": "PostgreSQL Tutorial: From Beginners to Advanced SQL",
        "provider": "PostgreSQL Tutorial",
        "skill_id": "sql-databases",
        "career_id": "full-stack-developer",
        "difficulty": "intermediate",
        "format": "documentation",
        "estimated_hours": 10,
        "is_free": True,
        "url": "https://www.postgresqltutorial.com/",
        "recommended_stage": 4
    },
    {
        "title": "OWASP Web Security Testing Guide",
        "provider": "OWASP",
        "skill_id": "api-security",
        "career_id": "full-stack-developer",
        "difficulty": "advanced",
        "format": "documentation",
        "estimated_hours": 8,
        "is_free": True,
        "url": "https://owasp.org/www-project-web-security-testing-guide/",
        "recommended_stage": 5
    }
]

@router.get("", response_model=List[LearningResourceOut])
def list_resources(
    skill_id: Optional[str] = Query(None),
    career_id: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(LearningResource)
    if skill_id:
        query = query.filter(LearningResource.skill_id == skill_id)
    if career_id:
        query = query.filter(LearningResource.career_id == career_id)
    if difficulty:
        query = query.filter(LearningResource.difficulty == difficulty)

    results = query.all()
    if not results:
        # Seed in-memory defaults if table is empty
        for r_data in CURATED_DEFAULT_RESOURCES:
            r = LearningResource(**r_data)
            db.add(r)
        db.commit()
        results = db.query(LearningResource).all()

    return results

