"""
TargetYM - FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="TargetYM API",
    description="Backend API for TargetYM Recruitment Platform",
    version="1.0.0"
)

# CORS Configuration for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Models ====================

class Candidate(BaseModel):
    id: Optional[str] = None
    name: str
    email: EmailStr
    phone: str
    position: str
    status: str = "new"
    source: Optional[str] = None
    cv_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Interview(BaseModel):
    id: Optional[str] = None
    candidate_id: str
    type: str
    scheduled_at: datetime
    duration: int
    location: Optional[str] = None
    meeting_url: Optional[str] = None
    interviewers: List[str]
    notes: Optional[str] = None
    status: str = "scheduled"
    created_at: Optional[datetime] = None

class JobPosting(BaseModel):
    id: Optional[str] = None
    title: str
    department: str
    location: str
    type: str  # full-time, part-time, contract
    status: str = "draft"
    description: str
    requirements: List[str]
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    published_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

# ==================== In-Memory Storage (Replace with DB later) ====================

candidates_db = []
interviews_db = []
jobs_db = []

# ==================== Routes ====================

@app.get("/")
async def root():
    """API Health Check"""
    return {
        "status": "online",
        "message": "TargetYM API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# ==================== Candidates Routes ====================

@app.get("/api/candidates", response_model=List[Candidate])
async def get_candidates(
    status: Optional[str] = None,
    position: Optional[str] = None,
    limit: int = 100
):
    """Get all candidates with optional filtering"""
    filtered = candidates_db

    if status:
        filtered = [c for c in filtered if c.get("status") == status]
    if position:
        filtered = [c for c in filtered if c.get("position") == position]

    return filtered[:limit]

@app.post("/api/candidates", response_model=Candidate, status_code=201)
async def create_candidate(candidate: Candidate):
    """Create a new candidate"""
    candidate_dict = candidate.model_dump()
    candidate_dict["id"] = str(len(candidates_db) + 1)
    candidate_dict["created_at"] = datetime.now()
    candidate_dict["updated_at"] = datetime.now()

    candidates_db.append(candidate_dict)
    return candidate_dict

@app.get("/api/candidates/{candidate_id}", response_model=Candidate)
async def get_candidate(candidate_id: str):
    """Get a specific candidate by ID"""
    candidate = next((c for c in candidates_db if c["id"] == candidate_id), None)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@app.put("/api/candidates/{candidate_id}", response_model=Candidate)
async def update_candidate(candidate_id: str, candidate: Candidate):
    """Update a candidate"""
    idx = next((i for i, c in enumerate(candidates_db) if c["id"] == candidate_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Candidate not found")

    candidate_dict = candidate.model_dump()
    candidate_dict["id"] = candidate_id
    candidate_dict["updated_at"] = datetime.now()

    candidates_db[idx] = candidate_dict
    return candidate_dict

@app.delete("/api/candidates/{candidate_id}")
async def delete_candidate(candidate_id: str):
    """Delete a candidate"""
    idx = next((i for i, c in enumerate(candidates_db) if c["id"] == candidate_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Candidate not found")

    candidates_db.pop(idx)
    return {"message": "Candidate deleted successfully"}

# ==================== Interviews Routes ====================

@app.get("/api/interviews", response_model=List[Interview])
async def get_interviews(
    candidate_id: Optional[str] = None,
    status: Optional[str] = None
):
    """Get all interviews with optional filtering"""
    filtered = interviews_db

    if candidate_id:
        filtered = [i for i in filtered if i.get("candidate_id") == candidate_id]
    if status:
        filtered = [i for i in filtered if i.get("status") == status]

    return filtered

@app.post("/api/interviews", response_model=Interview, status_code=201)
async def create_interview(interview: Interview):
    """Schedule a new interview"""
    interview_dict = interview.model_dump()
    interview_dict["id"] = str(len(interviews_db) + 1)
    interview_dict["created_at"] = datetime.now()

    interviews_db.append(interview_dict)
    return interview_dict

@app.put("/api/interviews/{interview_id}", response_model=Interview)
async def update_interview(interview_id: str, interview: Interview):
    """Update an interview"""
    idx = next((i for i, iv in enumerate(interviews_db) if iv["id"] == interview_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Interview not found")

    interview_dict = interview.model_dump()
    interview_dict["id"] = interview_id

    interviews_db[idx] = interview_dict
    return interview_dict

# ==================== Job Postings Routes ====================

@app.get("/api/jobs", response_model=List[JobPosting])
async def get_jobs(
    status: Optional[str] = None,
    department: Optional[str] = None
):
    """Get all job postings with optional filtering"""
    filtered = jobs_db

    if status:
        filtered = [j for j in filtered if j.get("status") == status]
    if department:
        filtered = [j for j in filtered if j.get("department") == department]

    return filtered

@app.post("/api/jobs", response_model=JobPosting, status_code=201)
async def create_job(job: JobPosting):
    """Create a new job posting"""
    job_dict = job.model_dump()
    job_dict["id"] = str(len(jobs_db) + 1)
    job_dict["created_at"] = datetime.now()

    jobs_db.append(job_dict)
    return job_dict

@app.get("/api/jobs/{job_id}", response_model=JobPosting)
async def get_job(job_id: str):
    """Get a specific job posting by ID"""
    job = next((j for j in jobs_db if j["id"] == job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.put("/api/jobs/{job_id}", response_model=JobPosting)
async def update_job(job_id: str, job: JobPosting):
    """Update a job posting"""
    idx = next((i for i, j in enumerate(jobs_db) if j["id"] == job_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Job not found")

    job_dict = job.model_dump()
    job_dict["id"] = job_id

    jobs_db[idx] = job_dict
    return job_dict

# ==================== Analytics Routes ====================

@app.get("/api/analytics/recruitment")
async def get_recruitment_analytics():
    """Get recruitment analytics and metrics"""
    total_candidates = len(candidates_db)
    total_interviews = len(interviews_db)
    total_jobs = len(jobs_db)

    # Status breakdown
    status_counts = {}
    for candidate in candidates_db:
        status = candidate.get("status", "unknown")
        status_counts[status] = status_counts.get(status, 0) + 1

    return {
        "total_candidates": total_candidates,
        "total_interviews": total_interviews,
        "total_jobs": total_jobs,
        "candidate_status_breakdown": status_counts,
        "active_jobs": len([j for j in jobs_db if j.get("status") == "published"]),
        "pending_interviews": len([i for i in interviews_db if i.get("status") == "scheduled"])
    }

# ==================== Run Server ====================

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
