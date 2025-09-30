from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import Base, engine
from .routers import auth as auth_router
from .routers import exams as exams_router
from .routers import exam_codes as exam_codes_router
from .routers import submissions as submissions_router


def create_app() -> FastAPI:
    Base.metadata.create_all(bind=engine)

    app = FastAPI(title="HyExam API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router.router, prefix="/auth", tags=["auth"])
    app.include_router(exams_router.router, prefix="/exams", tags=["exams"])
    app.include_router(exam_codes_router.router, prefix="/exams", tags=["exam-codes"])
    app.include_router(submissions_router.router, prefix="/exams", tags=["submissions"])

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok"}

    return app


app = create_app()
