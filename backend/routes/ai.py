from fastapi import APIRouter
from pydantic import BaseModel

from backend.ai.advisor import generate_growth_advice
from backend.routes.analytics import get_analytics

router = APIRouter()


class AIQuestion(BaseModel):
    question: str


@router.post("/ai/advice")
def get_ai_advice(request: AIQuestion):

    # Get current business analytics
    data = get_analytics()

    # Generate question-aware recommendation
    advice = generate_growth_advice(
        data,
        request.question
    )

    return advice