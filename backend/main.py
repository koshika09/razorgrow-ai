from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from backend.routes.analytics import router as analytics_router
from backend.routes.ai import router as ai_router
from backend.routes.agent import router as agent_router
from backend.services.audit_service import initialize_database


app = FastAPI(title="RazorGrow AI")

initialize_database()


# Analytics API
app.include_router(analytics_router)
app.include_router(ai_router)
app.include_router(agent_router)


# Serve frontend
app.mount(
    "/",
    StaticFiles(directory="frontend", html=True),
    name="frontend"
)