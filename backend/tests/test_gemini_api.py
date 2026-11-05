import asyncio

import pytest
from google.genai import types
from fastapi.testclient import TestClient

from app import gemini_service
from app.main import app


def test_gemini_response_schema_supports_nested_findings():
    schema = gemini_service._gemini_schema_for(gemini_service.ScopeAnalysisResult)

    assert types.Schema.model_validate(schema).type == "OBJECT"
    assert schema["properties"]["changes"]["items"]["properties"]["classification"]["enum"] == [
        "IN_SCOPE",
        "NEEDS_CLARIFICATION",
        "OUT_OF_SCOPE",
    ]
    assert "title" not in schema


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(gemini_service, "is_gemini_configured", lambda: True)
    return TestClient(app)


def test_gemini_analysis_uses_contract_evidence_and_freelancer_rate(client, monkeypatch):
    async def fake_analyze_agreement(project, client_message, tone):
        assert project["included_deliverables"] == ["Five-page marketing website"]
        assert "admin dashboard" in client_message
        assert tone == "professional"
        return gemini_service.ScopeAnalysisResult(
            changes=[
                gemini_service.ScopeFinding(
                    requested_item="Admin dashboard",
                    classification="OUT_OF_SCOPE",
                    severity="high",
                    reason="The agreement includes a five-page website, not a dashboard.",
                    suggested_hours=8,
                )
            ],
            ai_explanation="The admin dashboard is a new feature outside the agreed website deliverables.",
            suggested_action="Agree on the additional scope before work begins.",
            client_reply="The dashboard is outside the original scope. We can agree on the added cost and schedule first.",
        )

    monkeypatch.setattr(gemini_service, "analyze_agreement", fake_analyze_agreement)
    response = client.post("/api/ai/analyze", json={
        "project": {
            "id": "project-1",
            "name": "Marketing Website",
            "client_name": "Acme",
            "currency": "$",
            "budget": 5000,
            "hourly_rate": 100,
            "deadline": "",
            "included_deliverables": ["Five-page marketing website"],
            "excluded_deliverables": [],
            "revision_limit": 2,
            "revisions_used": 0,
        },
        "client_message": "Please add an admin dashboard.",
        "tone": "professional",
    })

    assert response.status_code == 200
    result = response.json()
    assert result["overall_classification"] == "OUT_OF_SCOPE"
    assert result["changes"][0]["classification"] == "OUT_OF_SCOPE"
    assert result["changes"][0]["contract_evidence"].startswith("No matching included or excluded clause")
    assert result["total_adjusted_hours"] == 8
    assert result["total_cost"] == 800
    assert "dashboard" in result["generated_response_text"]

def test_gemini_routes_report_missing_backend_key(client, monkeypatch):
    monkeypatch.setattr(gemini_service, "is_gemini_configured", lambda: False)
    response = client.post("/api/ai/extract-scope", json={"raw_brief": "A complete website project brief."})

    assert response.status_code == 503
    assert "GEMINI_API_KEY" in response.json()["detail"]


def test_unmatched_in_scope_result_is_downgraded_to_clarification(monkeypatch):
    async def fake_generate(prompt, response_schema):
        return gemini_service.ScopeAnalysisResult(
            changes=[
                gemini_service.ScopeFinding(
                    requested_item="New analytics dashboard",
                    classification="IN_SCOPE",
                    reason="The agreement does not say whether this dashboard is included.",
                    suggested_hours=4,
                )
            ],
            ai_explanation="The agreement does not clearly define this feature.",
            suggested_action="Clarify the dashboard requirements and scope.",
            client_reply="Could you share more details so we can confirm whether this is included?",
        )

    monkeypatch.setattr(gemini_service, "_generate_structured", fake_generate)
    result = asyncio.run(
        gemini_service.analyze_agreement(
            {
                "name": "Website",
                "client_name": "Client",
                "included_deliverables": ["Five-page website"],
                "excluded_deliverables": [],
                "revision_limit": 2,
                "revisions_used": 0,
            },
            "Please add an analytics dashboard.",
            "professional",
        )
    )

    assert result.changes[0].classification == "NEEDS_CLARIFICATION"
    assert result.changes[0].suggested_hours == 0
