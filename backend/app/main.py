import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.seed_data import seed_database

# Import routers
from app.api.endpoints import (
    auth, careers, assessments, skills, roadmaps,
    planner, projects, resources, integrity, certificates,
    mentors, admin
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed database
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent AI-Assisted Career Navigation, Diagnostic Assessment, Prerequisite Roadmaps, and Verifiable Certificates for Students",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits localhost dev ports & mobile/tablet clients
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=f"{api_prefix}/auth", tags=["Authentication & Profiles"])
app.include_router(careers.router, prefix=f"{api_prefix}/careers", tags=["Career Exploration & Matching"])
app.include_router(assessments.router, prefix=f"{api_prefix}/assessments", tags=["Diagnostic & Practice Assessments"])
app.include_router(skills.router, prefix=f"{api_prefix}/skills", tags=["Skills & Gap Analysis"])
app.include_router(roadmaps.router, prefix=f"{api_prefix}/roadmaps", tags=["AI & Adaptive Roadmaps"])
app.include_router(planner.router, prefix=f"{api_prefix}/planner", tags=["Weekly Study Planner"])
app.include_router(projects.router, prefix=f"{api_prefix}/projects", tags=["Practical Projects & Portfolio"])
app.include_router(resources.router, prefix=f"{api_prefix}/resources", tags=["Curated Learning Resources"])
app.include_router(integrity.router, prefix=f"{api_prefix}/integrity", tags=["Consent-Based Integrity Module"])
app.include_router(certificates.router, prefix=f"{api_prefix}/certificates", tags=["Certificates & Public Verification"])
app.include_router(mentors.router, prefix=f"{api_prefix}/mentors", tags=["Mentor & Faculty Workflows"])
app.include_router(admin.router, prefix=f"{api_prefix}/admin", tags=["Administration & Audit"])

from fastapi.responses import FileResponse

FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/api/download-report")
@app.get("/download-report")
def download_project_report():
    report_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "AI_CareerPath_Complete_Project_Report.pdf"))
    if not os.path.exists(report_path):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Project report PDF not found")
    return FileResponse(
        path=report_path,
        filename="AI_CareerPath_Complete_Project_Report.pdf",
        media_type="application/pdf"
    )

@app.get("/api/health")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_model": settings.AI_MODEL,
        "ai_provider_ready": bool(settings.GEMINI_API_KEY)
    }

@app.get("/")
def root():
    index_file = os.path.join(FRONTEND_DIST, "index.html") if os.path.exists(FRONTEND_DIST) else None
    if index_file and os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "system": settings.PROJECT_NAME,
        "status": "operational",
        "documentation": "/docs",
        "api_v1": api_prefix
    }

if os.path.exists(FRONTEND_DIST):
    @app.get("/{full_path:path}")
    async def serve_spa_frontend(full_path: str):
        if full_path.startswith("api/") or full_path == "api":
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="API route not found")
        target = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.exists(target) and os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

