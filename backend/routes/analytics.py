from fastapi import APIRouter, HTTPException
from backend.services.analytics import AnalyticsError, get_merchant_analytics

router = APIRouter(tags=["analytics"])


@router.get("/analytics")
def get_analytics():
    try:
        return get_merchant_analytics()
    except AnalyticsError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
