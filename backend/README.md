HyExam Backend (FastAPI)

Quickstart

1. Create virtualenv (optional) and install deps:
   pip install -r requirements.txt

2. Run dev server (SQLite by default):
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

3. Open API docs:
   http://localhost:8000/docs

Environment

- DATABASE_URL: default sqlite:///./hyexam.db
- SECRET_KEY: JWT secret (set in production)
- ACCESS_TOKEN_EXPIRE_HOURS: default 12

Roles

- admin: create teachers/students via /auth/admin/create_user
- teacher: create and publish exams, generate/export codes
- student/community: join with exam code, submit answers

Key endpoints

- POST /auth/register: self-register as community
- POST /auth/login: OAuth2 password (username=email)
- GET /auth/me
- POST /auth/admin/create_user (admin only)
- POST /exams/: create exam with questions
- POST /exams/{id}/publish
- POST /exams/{id}/codes/generate
- GET  /exams/{id}/codes/export.csv
- POST /exams/{id}/join/{code}
- POST /exams/{id}/submissions/{sid}/submit
