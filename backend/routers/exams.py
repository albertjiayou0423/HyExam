from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Exam, Question, ExamSession, ExamAttempt, User
from schemas import (
    ExamCreate, ExamUpdate, Exam as ExamSchema,
    QuestionCreate, Question as QuestionSchema,
    ExamSessionCreate, ExamSession as ExamSessionSchema,
    ExamAttemptCreate, ExamAttempt as ExamAttemptSchema
)
from dependencies import get_current_user, get_teacher_or_admin
from auth import generate_exam_code
import json

router = APIRouter()

# Exam CRUD operations
@router.post("/", response_model=ExamSchema)
async def create_exam(
    exam_data: ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Create exam
    exam = Exam(
        title=exam_data.title,
        description=exam_data.description,
        instructions=exam_data.instructions,
        time_limit=exam_data.time_limit,
        is_public=exam_data.is_public,
        allow_review=exam_data.allow_review,
        shuffle_questions=exam_data.shuffle_questions,
        shuffle_options=exam_data.shuffle_options,
        status=exam_data.status.value,
        created_by=current_user.id
    )
    
    db.add(exam)
    db.commit()
    db.refresh(exam)
    
    # Create questions
    for i, question_data in enumerate(exam_data.questions):
        question = Question(
            exam_id=exam.id,
            type=question_data.type.value,
            content=question_data.content,
            options=json.dumps(question_data.options) if question_data.options else None,
            correct_answer=json.dumps(question_data.correct_answer),
            points=question_data.points,
            explanation=question_data.explanation,
            order=i
        )
        db.add(question)
    
    db.commit()
    db.refresh(exam)
    
    return ExamSchema.from_orm(exam)

@router.get("/", response_model=List[ExamSchema])
async def get_exams(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = None,
    is_public: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Exam)
    
    # Filter by user's exams or public exams
    if current_user.role == "admin":
        pass  # Admin can see all exams
    elif current_user.role == "teacher":
        query = query.filter(Exam.created_by == current_user.id)
    else:
        query = query.filter(Exam.is_public == True)
    
    if status:
        query = query.filter(Exam.status == status)
    if is_public is not None:
        query = query.filter(Exam.is_public == is_public)
    
    exams = query.offset(skip).limit(limit).all()
    return [ExamSchema.from_orm(exam) for exam in exams]

@router.get("/{exam_id}", response_model=ExamSchema)
async def get_exam(
    exam_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )
    
    # Check permissions
    if not exam.is_public and exam.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return ExamSchema.from_orm(exam)

@router.put("/{exam_id}", response_model=ExamSchema)
async def update_exam(
    exam_id: str,
    exam_data: ExamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_teacher_or_admin)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )
    
    # Check permissions
    if exam.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Update exam fields
    update_data = exam_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "status" and value:
            setattr(exam, field, value.value)
        else:
            setattr(exam, field, value)
    
    db.commit()
    db.refresh(exam)
    
    return ExamSchema.from_orm(exam)

@router.delete("/{exam_id}")
async def delete_exam(
    exam_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_teacher_or_admin)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )
    
    # Check permissions
    if exam.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db.delete(exam)
    db.commit()
    
    return {"message": "Exam deleted successfully"}

# Exam Session operations
@router.post("/sessions", response_model=ExamSessionSchema)
async def create_exam_session(
    session_data: ExamSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_teacher_or_admin)
):
    # Check if exam exists and user has permission
    exam = db.query(Exam).filter(Exam.id == session_data.exam_id).first()
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )
    
    if exam.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Generate unique exam code
    exam_code = generate_exam_code()
    while db.query(ExamSession).filter(ExamSession.exam_code == exam_code).first():
        exam_code = generate_exam_code()
    
    # Create exam session
    session = ExamSession(
        exam_id=session_data.exam_id,
        exam_code=exam_code,
        start_time=session_data.start_time,
        end_time=session_data.end_time,
        max_attempts=session_data.max_attempts,
        created_by=current_user.id
    )
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return ExamSessionSchema.from_orm(session)

@router.get("/sessions", response_model=List[ExamSessionSchema])
async def get_exam_sessions(
    active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ExamSession)
    
    # Filter by user's sessions or admin can see all
    if current_user.role != "admin":
        query = query.filter(ExamSession.created_by == current_user.id)
    
    if active is not None:
        query = query.filter(ExamSession.is_active == active)
    
    sessions = query.all()
    return [ExamSessionSchema.from_orm(session) for session in sessions]

@router.get("/sessions/{session_id}", response_model=ExamSessionSchema)
async def get_exam_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam session not found"
        )
    
    # Check permissions
    if session.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return ExamSessionSchema.from_orm(session)

# Exam attempt operations
@router.post("/attempts", response_model=ExamAttemptSchema)
async def create_exam_attempt(
    attempt_data: ExamAttemptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if session exists and is active
    session = db.query(ExamSession).filter(ExamSession.id == attempt_data.exam_session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam session not found"
        )
    
    if not session.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Exam session is not active"
        )
    
    # Check max attempts
    if session.max_attempts:
        existing_attempts = db.query(ExamAttempt).filter(
            ExamAttempt.exam_session_id == attempt_data.exam_session_id,
            ExamAttempt.user_id == current_user.id
        ).count()
        
        if existing_attempts >= session.max_attempts:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum attempts reached"
            )
    
    # Create exam attempt
    attempt = ExamAttempt(
        exam_id=session.exam_id,
        exam_session_id=attempt_data.exam_session_id,
        user_id=current_user.id,
        answers=attempt_data.answers
    )
    
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    return ExamAttemptSchema.from_orm(attempt)

@router.get("/attempts", response_model=List[ExamAttemptSchema])
async def get_exam_attempts(
    exam_id: Optional[str] = None,
    session_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ExamAttempt)
    
    # Filter by user's attempts
    if current_user.role != "admin":
        query = query.filter(ExamAttempt.user_id == current_user.id)
    
    if exam_id:
        query = query.filter(ExamAttempt.exam_id == exam_id)
    if session_id:
        query = query.filter(ExamAttempt.exam_session_id == session_id)
    
    attempts = query.all()
    return [ExamAttemptSchema.from_orm(attempt) for attempt in attempts]