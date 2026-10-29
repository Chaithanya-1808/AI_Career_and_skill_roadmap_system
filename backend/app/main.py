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

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "operational",
        "documentation": "/docs",
        "api_v1": api_prefix
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_model": settings.AI_MODEL,
        "ai_provider_ready": bool(settings.GEMINI_API_KEY)
    }
