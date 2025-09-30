from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Exam, Question, QuestionOption, QuestionType, User, UserRole
from ..schemas import ExamCreate, ExamOut
from ..security import require_roles


router = APIRouter()


@router.post("/", response_model=ExamOut)
def create_exam(payload: ExamCreate, db: Session = Depends(get_db), current_user: User = Depends(require_roles([UserRole.teacher, UserRole.admin]))):
    exam = Exam(title=payload.title, description=payload.description, owner_id=current_user.id)
    db.add(exam)
    db.flush()

    order_index = 0
    for q in payload.questions:
        question = Question(
            exam_id=exam.id,
            type=q.type,
            content=q.content,
            score=q.score,
            order_index=q.order_index or order_index,
        )
        db.add(question)
        db.flush()
        order_index += 1
        if q.type in {QuestionType.single_choice, QuestionType.multiple_choice, QuestionType.true_false}:
            if q.options:
                for idx, opt in enumerate(q.options):
                    db.add(QuestionOption(question_id=question.id, text=opt.text, is_correct=opt.is_correct, order_index=opt.order_index or idx))
    db.commit()
    db.refresh(exam)
    return exam


@router.get("/{exam_id}", response_model=ExamOut)
def get_exam(exam_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_roles([UserRole.teacher, UserRole.admin]))):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.owner_id == current_user.id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam


@router.post("/{exam_id}/publish", response_model=ExamOut)
def publish_exam(exam_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_roles([UserRole.teacher, UserRole.admin]))):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.owner_id == current_user.id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    exam.is_published = True
    db.commit()
    db.refresh(exam)
    return exam
