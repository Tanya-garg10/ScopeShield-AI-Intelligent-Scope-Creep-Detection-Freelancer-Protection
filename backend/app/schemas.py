from typing import List, Optional, Literal
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

class AIProjectContext(BaseModel):
    id: str
    name: str = Field(..., min_length=1, max_length=100)
    client_name: str = Field(default="", max_length=100)
    description: str = Field(default="", max_length=5000)
    original_brief: str = Field(default="", max_length=10000)
    notes: str = Field(default="", max_length=5000)
    currency: Literal["₹", "$", "€", "£"] = "₹"
    budget: float = Field(default=0, ge=0)
    hourly_rate: float = Field(default=0, ge=0)
    deadline: str = Field(default="", max_length=100)
    included_deliverables: List[str] = Field(default_factory=list, max_length=100)
    excluded_deliverables: List[str] = Field(default_factory=list, max_length=100)
    requirements: List[str] = Field(default_factory=list, max_length=100)
    conditions: List[str] = Field(default_factory=list, max_length=100)
    revision_limit: int = Field(default=0, ge=0)
    revisions_used: int = Field(default=0, ge=0)

class AIExtractScopeRequest(BaseModel):
    raw_brief: str = Field(..., min_length=10, max_length=10000)

class AIExtractScopeResponse(BaseModel):
    name: str
    client_name: str
    currency: Literal["₹", "$", "€", "£"]
    budget: float
    hourly_rate: float
    deadline: str
    included_deliverables: List[str]
    excluded_deliverables: List[str]
    revision_limit: int
    requirements: List[str]
    conditions: List[str]
    unclear_items: List[str]
    missing_terms: List[str]

class AIAnalyzeRequest(BaseModel):
    project: AIProjectContext
    client_message: str = Field(..., min_length=3, max_length=5000)
    tone: Literal["professional", "friendly", "formal"] = "professional"

class AIGeneratedFinding(BaseModel):
    id: str
    requested_item: str
    classification: Literal["IN_SCOPE", "NEEDS_CLARIFICATION", "OUT_OF_SCOPE"]
    severity: Literal["low", "medium", "high"]
    matched_original_item: Optional[str] = None
    matched_excluded_item: Optional[str] = None
    contract_evidence: str
    reason: str
    suggested_hours: float = Field(ge=0)
    user_adjusted_hours: float = Field(ge=0)
    user_approved: bool

class AIAnalyzeResponse(BaseModel):
    model_used: str
    overall_classification: Literal["IN_SCOPE", "NEEDS_CLARIFICATION", "OUT_OF_SCOPE"]
    ai_explanation: str
    evidence_original_scope: List[str]
    missing_information: List[str]
    suggested_action: str
    changes: List[AIGeneratedFinding]
    total_suggested_hours: float
    total_adjusted_hours: float
    total_cost: float
    currency: Literal["₹", "$", "€", "£"]
    suggested_timeline_extension_days: int
    generated_response_text: str

class AIReplyAnalysis(BaseModel):
    overall_classification: Literal["IN_SCOPE", "NEEDS_CLARIFICATION", "OUT_OF_SCOPE"]
    client_message: str = Field(..., min_length=1, max_length=5000)
    ai_explanation: str
    missing_information: List[str]
    changes: List[AIGeneratedFinding]
    total_adjusted_hours: float = Field(ge=0)
    total_cost: float = Field(ge=0)
    suggested_timeline_extension_days: int = Field(ge=0)

class AIReplyRequest(BaseModel):
    project: AIProjectContext
    analysis: AIReplyAnalysis
    tone: Literal["professional", "friendly", "formal"] = "professional"

class AIReplyResponse(BaseModel):
    generated_response_text: str
