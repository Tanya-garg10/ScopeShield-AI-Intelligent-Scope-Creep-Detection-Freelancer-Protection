import re
from typing import Dict, Any, List, Tuple
from app.schemas import ScopeChangeItem, AnalyzeResponse, ExtractScopeResponse

def analyze_scope(
    project_dict: Dict[str, Any],
    client_message: str,
    model_name: str = "qwen3:4b-instruct",
    is_demo: bool = False,
    tone: str = "professional"
) -> Dict[str, Any]:
    msg = client_message.strip()
    lower_msg = msg.lower()
    changes: List[ScopeChangeItem] = []

    hourly_rate = float(project_dict.get("hourly_rate", 1000.0))
    currency = project_dict.get("currency", "₹")
    budget = float(project_dict.get("budget", 30000.0))
    revision_limit = int(project_dict.get("revision_limit", 2))
    revisions_used = int(project_dict.get("revisions_used", 0))

    included: List[str] = project_dict.get("included_deliverables", [])
    excluded: List[str] = project_dict.get("excluded_deliverables", [])

    # 1. Payment gateway (Razorpay / Stripe)
    if any(k in lower_msg for k in ["razorpay", "stripe", "payment", "checkout", "gateway"]):
        matched_exc = next(
            (e for e in excluded if "payment" in e.lower() or "razorpay" in e.lower()),
            "Payment gateway integration"
        )
        changes.append(ScopeChangeItem(
            id="change-payment",
            requested_item="Payment gateway checkout integration (Razorpay)",
            classification="POTENTIAL_SCOPE_CHANGE",
            severity="high",
            matched_excluded_item=matched_exc,
            contract_evidence=f'Contract Excluded Section: "{matched_exc}". Explicitly outside the base agreement.',
            reason="The client requested adding payment gateway integration. Payment systems require API setup, webhooks, compliance, and currency handling.",
            suggested_hours=12.0,
            user_adjusted_hours=12.0,
            user_approved=True
        ))

    # 2. Extra pages
    page_match = re.search(r'(\d+|two|three|four|five)\s+(?:additional|extra|more)?\s*pages?', lower_msg)
    if page_match or "extra page" in lower_msg or "additional page" in lower_msg:
        num_pages = 3
        if page_match:
            word = page_match.group(1)
            num_pages = 3 if word == "three" else 2 if word == "two" else int(word) if word.isdigit() else 3

        matched_inc = next((i for i in included if "page" in i.lower()), "Agreed page limit")
        matched_exc = next((e for e in excluded if "page" in e.lower()), "Additional pages beyond initial scope")

        changes.append(ScopeChangeItem(
            id="change-pages",
            requested_item=f"{num_pages} additional custom responsive pages",
            classification="POTENTIAL_SCOPE_CHANGE",
            severity="high",
            matched_original_item=matched_inc,
            matched_excluded_item=matched_exc,
            contract_evidence=f'Agreement covers: "{matched_inc}". Exclusions state: "{matched_exc}".',
            reason=f"Client requested {num_pages} extra pages beyond the agreed initial 5 pages, requiring new layouts and mobile QA.",
            suggested_hours=float(num_pages * 5),
            user_adjusted_hours=float(num_pages * 5),
            user_approved=True
        ))

    # 3. Revision limit check
    if "revision" in lower_msg or "round" in lower_msg:
        matched_inc = next((i for i in included if "revision" in i.lower()), f"{revision_limit} revision rounds")
        if revisions_used >= revision_limit:
            changes.append(ScopeChangeItem(
                id="change-revision",
                requested_item="Additional round of revisions beyond contract limit",
                classification="POTENTIAL_SCOPE_CHANGE",
                severity="medium",
                matched_original_item=matched_inc,
                contract_evidence=f'Contract Revision Allowance: "{matched_inc}". Exhausted {revisions_used}/{revision_limit} rounds.',
                reason="Client asks for another round of revisions. The contract revision cap has been reached.",
                suggested_hours=4.0,
                user_adjusted_hours=4.0,
                user_approved=True
            ))
        else:
            changes.append(ScopeChangeItem(
                id="change-revision-included",
                requested_item="In-scope revision round",
                classification="LIKELY_IN_SCOPE",
                severity="low",
                matched_original_item=matched_inc,
                contract_evidence=f"Agreement includes {revision_limit} rounds. Currently used: {revisions_used}.",
                reason="This revision falls within the allocated contract limit.",
                suggested_hours=0.0,
                user_adjusted_hours=0.0,
                user_approved=False
            ))

    # Fallback if no specific trigger fired
    if not changes:
        changes.append(ScopeChangeItem(
            id="change-general",
            requested_item="Client modification inquiry",
            classification="NEEDS_HUMAN_REVIEW",
            severity="low",
            contract_evidence="Review against project deliverables and exclusions.",
            reason="Verify whether the request is a minor adjustment or constitutes new billable work.",
            suggested_hours=2.0,
            user_adjusted_hours=2.0,
            user_approved=True
        ))

    # Pricing arithmetic
    total_suggested_hours = sum(c.suggested_hours for c in changes if c.user_approved)
    total_adjusted_hours = sum(c.user_adjusted_hours for c in changes if c.user_approved)
    total_cost = total_adjusted_hours * hourly_rate
    timeline_days = 5 if total_adjusted_hours > 20 else 3 if total_adjusted_hours > 10 else 1

    # Generate response
    response_text = format_change_request(
        project_name=project_dict.get("name", "Project"),
        client_name=project_dict.get("client_name", "Client"),
        currency=currency,
        hourly_rate=hourly_rate,
        total_adjusted_hours=total_adjusted_hours,
        total_cost=total_cost,
        timeline_days=timeline_days,
        changes=changes,
        tone=tone
    )

    return {
        "changes": changes,
        "total_suggested_hours": total_suggested_hours,
        "total_adjusted_hours": total_adjusted_hours,
        "total_cost": total_cost,
        "currency": currency,
        "suggested_timeline_extension_days": timeline_days,
        "generated_response_text": response_text
    }

def format_change_request(
    project_name: str,
    client_name: str,
    currency: str,
    hourly_rate: float,
    total_adjusted_hours: float,
    total_cost: float,
    timeline_days: int,
    changes: List[ScopeChangeItem],
    tone: str = "professional"
) -> str:
    approved = [c for c in changes if c.user_approved and c.user_adjusted_hours > 0]
    
    items_breakdown = "\n".join([
        f"• **{c.requested_item}**: {c.user_adjusted_hours:.0f} hrs × {currency}{hourly_rate:.0f}/hr = {currency}{(c.user_adjusted_hours * hourly_rate):,.0f}\n  Reference: {c.contract_evidence}"
        for c in approved
    ])

    return f"""Hi {client_name} Team,

Thank you for your feedback! I'm glad to hear that you are pleased with the progress on the {project_name}.

Regarding your recent message requesting additional additions:
To ensure high quality and keep our project on solid footing, here is the transparent breakdown to incorporate these items:

{items_breakdown}

---
**Summary of Proposed Change Order**:
- **Total Additional Hours**: {total_adjusted_hours:.0f} billable hours
- **Additional Investment**: {currency}{total_cost:,.0f}
- **Timeline Impact**: +{timeline_days} business days to allow for implementation and QA.

Please confirm if you would like me to proceed with this Change Request. Once approved, I will update our project timeline and start work.

Best regards,
Your Freelance Partner"""

def extract_scope_from_text(raw_text: str) -> Dict[str, Any]:
    text = raw_text.strip()
    lower = text.lower()

    currency = "₹"
    if "$" in text or "usd" in lower or "dollar" in lower:
        currency = "$"
    elif "€" in text or "eur" in lower:
        currency = "€"
    elif "£" in text or "gbp" in lower:
        currency = "£"

    budget = 0.0
    budget_match = re.search(r'(?:budget|fee|cost|price)[:\s]*([₹$€£]?)\s*([\d,]+)', text, re.IGNORECASE)
    if budget_match:
        try:
            budget = float(budget_match.group(2).replace(",", ""))
        except ValueError:
            budget = 30000.0 if currency == "₹" else 3000.0
    else:
        budget = 30000.0 if currency == "₹" else 3000.0

    rate = 1000.0 if currency == "₹" else 75.0
    rate_match = re.search(r'(?:rate|hourly)[:\s]*([₹$€£]?)\s*([\d,]+)', text, re.IGNORECASE)
    if rate_match:
        try:
            rate = float(rate_match.group(2).replace(",", ""))
        except ValueError:
            pass

    revision_limit = 2
    rev_match = re.search(r'(\d+)\s*(?:rounds? of revisions?|revisions?)', lower)
    if rev_match:
        revision_limit = int(rev_match.group(1))

    included = [
        "Up to 5 custom responsive pages",
        "Mobile browser responsive design",
        "Contact form and lead capture"
    ]
    excluded = [
        "Payment gateway integration (e.g. Razorpay, Stripe)",
        "Additional pages beyond agreed limit",
        "Ongoing server maintenance"
    ]

    missing = []
    if "deadline" not in lower and "due" not in lower:
        missing.append("Firm Delivery Deadline (needs confirmation)")
    if "exclusion" not in lower and "excluded" not in lower:
        missing.append("Explicit Excluded Boundaries (needs confirmation)")

    return {
        "name": text.splitlines()[0][:50] if text else "New Project Scope",
        "client_name": "Client (To be confirmed)",
        "currency": currency,
        "budget": budget,
        "hourly_rate": rate,
        "deadline": "2026-11-30",
        "included_deliverables": included,
        "excluded_deliverables": excluded,
        "revision_limit": revision_limit,
        "payment_milestones": [
            f"50% upfront deposit ({currency}{(budget * 0.5):,.0f})",
            f"50% upon final signoff ({currency}{(budget * 0.5):,.0f})"
        ],
        "missing_terms": missing
    }
