import pytest
from app.analyzer import analyze_scope, extract_scope_from_text, format_change_request
from app.schemas import ScopeChangeItem

SAMPLE_ECOMMERCE_PROJECT = {
    "id": "test-ecommerce",
    "name": "E-commerce Website Redesign",
    "client_name": "Modern Goods Ltd.",
    "currency": "₹",
    "budget": 30000.0,
    "hourly_rate": 1000.0,
    "revision_limit": 2,
    "revisions_used": 2,
    "included_deliverables": [
        "Up to five (5) custom responsive website pages",
        "Product listing catalog with category filtering",
        "Contact form with email dispatch",
        "Two (2) formal rounds of revisions"
    ],
    "excluded_deliverables": [
        "Payment gateway integration (Razorpay, Stripe)",
        "Additional pages beyond the initial 5 pages",
        "Ongoing server maintenance and hosting"
    ]
}

def test_razorpay_scope_creep_detected():
    """Verify that requesting Razorpay checkout correctly flags as POTENTIAL_SCOPE_CHANGE with contract citation."""
    message = "Could you also add Razorpay checkout before Friday?"
    result = analyze_scope(SAMPLE_ECOMMERCE_PROJECT, message)

    changes = result["changes"]
    payment_change = next((c for c in changes if "Razorpay" in c.requested_item or "Payment" in c.requested_item), None)

    assert payment_change is not None, "Razorpay should be identified as a requested change"
    assert payment_change.classification == "POTENTIAL_SCOPE_CHANGE"
    assert payment_change.severity == "high"
    assert "Excluded" in payment_change.contract_evidence
    assert payment_change.suggested_hours > 0

def test_pricing_arithmetic_calculation():
    """Verify that hourly rates and total adjusted hours calculate correct addendum costs without rounding bugs."""
    message = "Could you also add Razorpay checkout and three additional pages?"
    result = analyze_scope(SAMPLE_ECOMMERCE_PROJECT, message)

    hourly_rate = SAMPLE_ECOMMERCE_PROJECT["hourly_rate"]
    total_hours = result["total_adjusted_hours"]
    expected_cost = total_hours * hourly_rate

    assert result["total_cost"] == expected_cost, f"Total cost should be {expected_cost}, got {result['total_cost']}"
    assert result["total_cost"] > 0
    assert result["currency"] == "₹"

def test_revision_limit_exhausted():
    """Verify that requesting an extra revision when revisions_used == revision_limit flags as out-of-scope."""
    message = "We need another round of revisions. We assumed this was included."
    result = analyze_scope(SAMPLE_ECOMMERCE_PROJECT, message)

    changes = result["changes"]
    rev_change = next((c for c in changes if "revision" in c.requested_item.lower()), None)

    assert rev_change is not None
    assert rev_change.classification == "POTENTIAL_SCOPE_CHANGE"
    assert "2/2" in rev_change.contract_evidence or "Exhausted" in rev_change.contract_evidence

def test_missing_terms_detection():
    """Verify that raw client briefs without explicit exclusions or deadlines are marked with missing terms."""
    brief = "Hey Tanya, build me a 5 page portfolio site. Budget is 20000 INR."
    extracted = extract_scope_from_text(brief)

    assert extracted["currency"] == "₹"
    assert extracted["budget"] == 20000.0
    assert len(extracted["missing_terms"]) > 0
    assert any("Deadline" in term for term in extracted["missing_terms"])

def test_invalid_ai_output_fallback():
    """Verify that ambiguous or unusual inputs never crash the engine and default to human review."""
    message = "xyz!@#$%^&*() Random noise without recognizable keywords"
    result = analyze_scope(SAMPLE_ECOMMERCE_PROJECT, message)

    assert len(result["changes"]) > 0
    assert result["changes"][0].classification == "NEEDS_HUMAN_REVIEW"
    assert result["generated_response_text"] != ""
