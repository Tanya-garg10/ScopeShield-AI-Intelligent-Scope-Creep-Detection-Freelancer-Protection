import json
import uuid
from datetime import datetime
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    ProjectCreate, ProjectResponse, 
    AnalyzeRequest, AnalyzeResponse,
    ExtractScopeRequest, ExtractScopeResponse,
    AIExtractScopeRequest, AIExtractScopeResponse,
    AIAnalyzeRequest, AIAnalyzeResponse, AIGeneratedFinding,
    AIReplyRequest, AIReplyResponse,
)
from app.database import get_db, init_db
from app.analyzer import analyze_scope, extract_scope_from_text
from app.ollama_client import check_ollama_health
from app import gemini_service

app = FastAPI(
    title="ScopeShield AI API",
    description="Open-source, privacy-first API for freelance project scope management, scope creep detection, and change request generation.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/health", tags=["System"])
async def health_check():
    ollama_status = await check_ollama_health()
    return {
        "status": "healthy",
        "app": "ScopeShield AI Backend",
        "version": "1.0.0",
        "inference_engine": "Ollama / Qwen3 4B Instruct",
        "ollama": ollama_status,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/ai/status", tags=["Gemini AI"])
async def ai_status():
    return {
        "configured": gemini_service.is_gemini_configured(),
        "provider": "Gemini",
        "model": gemini_service.GEMINI_MODEL,
    }

@app.post("/api/ai/extract-scope", response_model=AIExtractScopeResponse, tags=["Gemini AI"])
async def extract_scope_with_gemini(req: AIExtractScopeRequest):
    if not gemini_service.is_gemini_configured():
        raise HTTPException(status_code=503, detail="Gemini is not configured. Set GEMINI_API_KEY on the backend.")
    try:
        extracted = await gemini_service.extract_brief(req.raw_brief)
        return AIExtractScopeResponse(**extracted.model_dump())
    except ValueError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=502, detail="Gemini brief extraction failed. Check the backend logs and API configuration.") from error

@app.post("/api/ai/analyze", response_model=AIAnalyzeResponse, tags=["Gemini AI"])
async def analyze_scope_with_gemini(req: AIAnalyzeRequest):
    if not gemini_service.is_gemini_configured():
        raise HTTPException(status_code=503, detail="Gemini is not configured. Set GEMINI_API_KEY on the backend.")
    project = req.project.model_dump()
    try:
        result = await gemini_service.analyze_agreement(project, req.client_message, req.tone)
    except ValueError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=502, detail="Gemini scope analysis failed. Check the backend logs and API configuration.") from error

    classifications = [change.classification for change in result.changes]
    overall_classification = (
        "OUT_OF_SCOPE" if "OUT_OF_SCOPE" in classifications else
        "NEEDS_CLARIFICATION" if "NEEDS_CLARIFICATION" in classifications else
        "IN_SCOPE"
    )
    changes = []
    evidence = []
    for index, finding in enumerate(result.changes, start=1):
        matched_original = finding.matched_original_item or None
        matched_excluded = finding.matched_excluded_item or None
        if matched_excluded:
            contract_evidence = f'Explicitly excluded in the agreement: "{matched_excluded}".'
        elif matched_original:
            contract_evidence = f'Included in the agreement: "{matched_original}".'
        else:
            included = (
                project["included_deliverables"]
                + project["requirements"]
                + project["conditions"]
            )
            contract_evidence = (
                "No matching included or excluded clause was found in the agreement."
                + (f' The agreement lists: "{included[0]}".' if included else " The agreement has no listed included deliverables.")
            )
        evidence.append(contract_evidence)
        changes.append(AIGeneratedFinding(
            id=f"gemini-change-{index}",
            requested_item=finding.requested_item,
            classification=finding.classification,
            severity=finding.severity,
            matched_original_item=matched_original,
            matched_excluded_item=matched_excluded,
            contract_evidence=contract_evidence,
            reason=finding.reason,
            suggested_hours=finding.suggested_hours,
            user_adjusted_hours=finding.suggested_hours,
            user_approved=finding.classification == "OUT_OF_SCOPE",
        ))

    total_hours = sum(change.user_adjusted_hours for change in changes if change.user_approved)
    total_cost = total_hours * project["hourly_rate"]
    timeline_days = 5 if total_hours > 20 else 3 if total_hours > 10 else 1 if total_hours > 0 else 0
    return AIAnalyzeResponse(
        model_used=gemini_service.GEMINI_MODEL,
        overall_classification=overall_classification,
        ai_explanation=result.ai_explanation,
        evidence_original_scope=evidence,
        missing_information=result.missing_information,
        suggested_action=result.suggested_action,
        changes=changes,
        total_suggested_hours=total_hours,
        total_adjusted_hours=total_hours,
        total_cost=total_cost,
        currency=project["currency"],
        suggested_timeline_extension_days=timeline_days,
        generated_response_text=result.client_reply,
    )

@app.post("/api/ai/reply", response_model=AIReplyResponse, tags=["Gemini AI"])
async def generate_reply_with_gemini(req: AIReplyRequest):
    if not gemini_service.is_gemini_configured():
        raise HTTPException(status_code=503, detail="Gemini is not configured. Set GEMINI_API_KEY on the backend.")
    try:
        reply = await gemini_service.generate_client_reply(
            req.project.model_dump(),
            req.analysis.model_dump(),
            req.tone,
        )
        return AIReplyResponse(generated_response_text=reply)
    except ValueError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=502, detail="Gemini reply generation failed. Check the backend logs and API configuration.") from error

@app.get("/api/projects", response_model=List[ProjectResponse], tags=["Projects"])
def list_projects():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        result.append(ProjectResponse(
            id=r["id"],
            name=r["name"],
            client_name=r["client_name"],
            currency=r["currency"],
            budget=r["budget"],
            hourly_rate=r["hourly_rate"],
            deadline=r["deadline"],
            included_deliverables=json.loads(r["included_deliverables"]),
            excluded_deliverables=json.loads(r["excluded_deliverables"]),
            revision_limit=r["revision_limit"],
            revisions_used=r["revisions_used"],
            payment_milestones=json.loads(r["payment_milestones"]),
            notes=r["notes"],
            is_demo=bool(r["is_demo"]),
            created_at=r["created_at"],
            updated_at=r["updated_at"]
        ))
    return result

@app.post("/api/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED, tags=["Projects"])
def create_project(data: ProjectCreate):
    conn = get_db()
    cursor = conn.cursor()
    new_id = f"proj-{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat()

    cursor.execute("""
    INSERT INTO projects (
        id, name, client_name, currency, budget, hourly_rate, deadline,
        included_deliverables, excluded_deliverables, revision_limit, revisions_used,
        payment_milestones, notes, is_demo, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    """, (
        new_id, data.name, data.client_name, data.currency, data.budget, data.hourly_rate,
        data.deadline, json.dumps(data.included_deliverables), json.dumps(data.excluded_deliverables),
        data.revision_limit, data.revisions_used, json.dumps(data.payment_milestones),
        data.notes, now, now
    ))
    conn.commit()
    conn.close()

    return ProjectResponse(
        id=new_id,
        created_at=now,
        updated_at=now,
        is_demo=False,
        **data.dict()
    )

@app.get("/api/projects/{project_id}", response_model=ProjectResponse, tags=["Projects"])
def get_project(project_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Project not found")

    return ProjectResponse(
        id=row["id"],
        name=row["name"],
        client_name=row["client_name"],
        currency=row["currency"],
        budget=row["budget"],
        hourly_rate=row["hourly_rate"],
        deadline=row["deadline"],
        included_deliverables=json.loads(row["included_deliverables"]),
        excluded_deliverables=json.loads(row["excluded_deliverables"]),
        revision_limit=row["revision_limit"],
        revisions_used=row["revisions_used"],
        payment_milestones=json.loads(row["payment_milestones"]),
        notes=row["notes"],
        is_demo=bool(row["is_demo"]),
        created_at=row["created_at"],
        updated_at=row["updated_at"]
    )

@app.delete("/api/projects/{project_id}", tags=["Projects"])
def delete_project(project_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    conn.commit()
    conn.close()
    return {"message": "Project deleted successfully", "id": project_id}

@app.post("/api/analyze", response_model=AnalyzeResponse, tags=["Scope Creep Engine"])
def analyze_client_request(req: AnalyzeRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE id = ?", (req.project_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")

    project_dict = {
        "id": row["id"],
        "name": row["name"],
        "client_name": row["client_name"],
        "currency": row["currency"],
        "budget": row["budget"],
        "hourly_rate": row["hourly_rate"],
        "revision_limit": row["revision_limit"],
        "revisions_used": row["revisions_used"],
        "included_deliverables": json.loads(row["included_deliverables"]),
        "excluded_deliverables": json.loads(row["excluded_deliverables"])
    }

    # Run analysis
    analysis_result = analyze_scope(
        project_dict=project_dict,
        client_message=req.client_message,
        is_demo=req.use_demo_mode,
        tone=req.tone or "professional"
    )

    analysis_id = f"analysis-{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat()

    # Record analysis in database
    cursor.execute("""
    INSERT INTO analyses (
        id, project_id, project_name, client_name, client_message, model_used,
        is_demo_mode, changes, total_suggested_hours, total_adjusted_hours,
        total_cost, currency, suggested_timeline_extension_days,
        generated_response_text, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        analysis_id, row["id"], row["name"], row["client_name"], req.client_message,
        "qwen3:4b-instruct" if not req.use_demo_mode else "Deterministic Engine (Demo Mode)",
        1 if req.use_demo_mode else 0,
        json.dumps([c.dict() for c in analysis_result["changes"]]),
        analysis_result["total_suggested_hours"],
        analysis_result["total_adjusted_hours"],
        analysis_result["total_cost"],
        analysis_result["currency"],
        analysis_result["suggested_timeline_extension_days"],
        analysis_result["generated_response_text"],
        now
    ))
    conn.commit()
    conn.close()

    return AnalyzeResponse(
        id=analysis_id,
        project_id=row["id"],
        project_name=row["name"],
        client_name=row["client_name"],
        client_message=req.client_message,
        timestamp=now,
        model_used="qwen3:4b-instruct" if not req.use_demo_mode else "Deterministic Engine (Demo Mode)",
        is_demo_mode=req.use_demo_mode,
        changes=analysis_result["changes"],
        total_suggested_hours=analysis_result["total_suggested_hours"],
        total_adjusted_hours=analysis_result["total_adjusted_hours"],
        total_cost=analysis_result["total_cost"],
        currency=analysis_result["currency"],
        suggested_timeline_extension_days=analysis_result["suggested_timeline_extension_days"],
        generated_response_text=analysis_result["generated_response_text"]
    )

@app.post("/api/extract-scope", response_model=ExtractScopeResponse, tags=["Scope Builder"])
def extract_scope(req: ExtractScopeRequest):
    extracted = extract_scope_from_text(req.raw_brief)
    return ExtractScopeResponse(**extracted)
