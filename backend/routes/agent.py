from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.ai.agent import approve_growth_action, create_growth_action, get_actions, mark_payment_verified
from backend.services.analytics import AnalyticsError, get_merchant_analytics
from backend.services.razorpay_service import PaymentConfigurationError, verify_test_payment

router = APIRouter(tags=["agent"])
class GrowthActionRequest(BaseModel):
    product: str = Field(min_length=1, max_length=100); category: str = Field(min_length=1, max_length=100)
    title: str = Field(min_length=1, max_length=160); recommendation: str = Field(min_length=1, max_length=1000); evidence: str = Field(min_length=1, max_length=1000)
    campaign: dict | None = None
class ApprovalRequest(BaseModel): action_id: str = Field(min_length=8, max_length=80)
class PaymentVerificationRequest(BaseModel):
    razorpay_payment_id: str = Field(min_length=1, max_length=100); razorpay_order_id: str = Field(min_length=1, max_length=100); razorpay_signature: str = Field(min_length=1, max_length=300)

@router.post("/agent/propose", status_code=201)
def propose_action(request: GrowthActionRequest):
    try:
        data = get_merchant_analytics()
        if request.product not in data["product_revenue"] or data["product_categories"].get(request.product) != request.category: raise HTTPException(422, "Product and category must match merchant data.")
        base = data["product_revenue"][request.product]; low, high = round(base * .03), round(base * .08)
        simulation = {"label": "Simulation / Estimate", "base_revenue": base, "impact_low": low, "impact_high": high, "formula": "3%–8% of the target product's current revenue; this is a transparent planning estimate, not a forecast."}
        return create_growth_action(request.product, request.category, request.title, request.recommendation, request.evidence, simulation, request.campaign)
    except AnalyticsError as exc: raise HTTPException(503, str(exc)) from exc

@router.post("/agent/approve")
def approve_action(request: ApprovalRequest):
    action, error = approve_growth_action(request.action_id)
    if error == "not_found": raise HTTPException(404, "Growth action not found.")
    if error == "invalid_state": raise HTTPException(409, "This growth action cannot be approved in its current state.")
    return action

@router.get("/agent/audit")
def audit_log(status: str | None = None):
    actions = get_actions()
    return {"actions": [item for item in actions if not status or item.get("status") == status]}

@router.post("/agent/payment/verify")
def verify_payment(request: PaymentVerificationRequest):
    try: verify_test_payment(request.model_dump())
    except PaymentConfigurationError as exc: raise HTTPException(503, "Razorpay Test Mode is not configured.") from exc
    except Exception as exc: raise HTTPException(400, "Payment verification failed. The action was not marked complete.") from exc
    action, error = mark_payment_verified(request.razorpay_order_id, request.razorpay_payment_id)
    if error == "order_not_found": raise HTTPException(404, "No growth action matches this payment order.")
    if error == "invalid_state": raise HTTPException(409, "This payment order is not awaiting verification.")
    return {"success": True, "status": action["status"], "action": action}
