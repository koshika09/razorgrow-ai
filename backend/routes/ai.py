from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.ai.advisor import generate_growth_advice
from backend.services.analytics import AnalyticsError, get_cross_sell_opportunities, get_merchant_analytics

router = APIRouter(tags=["intelligence"])

class AIQuestion(BaseModel): question: str = Field(min_length=2, max_length=500)

@router.post("/ai/advice")
def get_ai_advice(request: AIQuestion):
    try: return generate_growth_advice(get_merchant_analytics(), request.question)
    except AnalyticsError as exc: raise HTTPException(503, str(exc)) from exc

@router.get("/ai/opportunities")
def opportunities():
    try:
        data = get_merchant_analytics()
        primary = generate_growth_advice(data)
        lowest = list(data["product_revenue"].items())[-1]
        items = [{"opportunity_id": "best-seller", "type": "Best seller promotion", **primary},
                 {"opportunity_id": "aov", "type": "AOV opportunity", **generate_growth_advice(data, "increase average order value")},
                 {"opportunity_id": "low-performer", "type": "Low-performing product review", "title": f"Review {lowest[0]}", "recommended_product": lowest[0], "recommended_category": data["product_categories"][lowest[0]], "evidence": f"{lowest[0]} has the lowest product revenue at ₹{lowest[1]:,.0f}.", "recommendation": "Review positioning, pricing, and inventory before adding promotion spend.", "reason": "This is a diagnostic opportunity, not a claim that the product lacks demand.", "expected_goal": "Improve product efficiency or avoid unproductive spend.", "confidence": "Medium", "risk_level": "Medium", "action": f"Review {lowest[0]}"}]
        return {"opportunities": items, "cross_sell": get_cross_sell_opportunities(), "cross_sell_message": None if data["data_quality"]["has_transaction_baskets"] else "Insufficient multi-product basket data for a trustworthy cross-sell recommendation."}
    except AnalyticsError as exc: raise HTTPException(503, str(exc)) from exc
