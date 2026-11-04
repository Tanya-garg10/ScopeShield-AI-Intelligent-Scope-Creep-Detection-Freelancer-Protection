from typing import List, Optional
from pydantic import BaseModel, Field

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    client_name: str = Field(..., min_length=2, max_length=100)
    currency: str = Field(default="₹", max_length=5)
    budget: float = Field(..., ge=0)
    hourly_rate: float = Field(..., ge=0)
    deadline: str
    included_deliverables: List[str] = Field(default_factory=list)
    excluded_deliverables: List[str] = Field(default_factory=list)
    revision_limit: int = Field(default=2, ge=0)
    revisions_used: int = Field(default=0, ge=0)
    payment_milestones: List[str] = Field(default_factory=list)
    notes: Optional[str] = None

class ProjectResponse(ProjectCreate):
    id: str
    created_at: str
    updated_at: str
    is_demo: bool = False

class ScopeChangeItem(BaseModel):
    id: str
    requested_item: str
    classification: str  # LIKELY_IN_SCOPE, POTENTIAL_SCOPE_CHANGE, NEEDS_HUMAN_REVIEW
    severity: str        # low, medium, high
    matched_original_item: Optional[str] = None
    matched_excluded_item: Optional[str] = None
    contract_evidence: str
    reason: str
    suggested_hours: float
    user_adjusted_hours: float
    user_approved: bool = True

class AnalyzeRequest(BaseModel):
    project_id: str
    client_message: str = Field(..., min_length=3, max_length=5000)
    use_demo_mode: bool = False
    tone: Optional[str] = "professional"

class AnalyzeResponse(BaseModel):
    id: str
    project_id: str
    project_name: str
    client_name: str
    client_message: str
    timestamp: str
    model_used: str
    is_demo_mode: bool
    changes: List[ScopeChangeItem]
    total_suggested_hours: float
    total_adjusted_hours: float
    total_cost: float
    currency: str
    suggested_timeline_extension_days: int
    generated_response_text: str

class ExtractScopeRequest(BaseModel):
    raw_brief: str = Field(..., min_length=10, max_length=10000)

class ExtractScopeResponse(BaseModel):
    name: str
    client_name: str
    currency: str
    budget: float
    hourly_rate: float
    deadline: str
    included_deliverables: List[str]
    excluded_deliverables: List[str]
    revision_limit: int
    payment_milestones: List[str]
    missing_terms: List[str]
