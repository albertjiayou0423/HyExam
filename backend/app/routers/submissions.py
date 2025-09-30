from datetime import datetime
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Answer, Exam, ExamCode, Question, QuestionOption, QuestionType, Submission, User, UserRole
from ..schemas import SubmitRequest, ExamForTakingOut, QuestionOptionStudentOut, QuestionStudentOut
from ..security import get_current_user


router = APIRouter()


def _grade_question(question: Question, answer_payload: Dict) -> Dict[str, Optional[float]]:
    if question.type == QuestionType.fill_in_blank:
        text_answer = (answer_payload.get("text_answer") or "").strip()
        # For v1, fill-in-blank not auto-graded
        return {"is_correct": None, "score": None}
    if question.type == QuestionType.true_false:
        selected = set(answer_payload.get("selected_option_ids") or [])
        correct_ids = {opt.id for opt in question.options if opt.is_correct}
        is_correct = selected == correct_ids
        return {"is_correct": is_correct, "score": float(question.score) if is_correct else 0.0}
    if question.type == QuestionType.single_choice:
        selected = set(answer_payload.get("selected_option_ids") or [])
        correct_ids = {opt.id for opt in question.options if opt.is_correct}
        is_correct = selected == correct_ids
        return {"is_correct": is_correct, "score": float(question.score) if is_correct else 0.0}
    if question.type == QuestionType.multiple_choice:
        selected = set(answer_payload.get("selected_option_ids") or [])
        correct_ids = {opt.id for opt in question.options if opt.is_correct}
        is_correct = selected == correct_ids
        return {"is_correct": is_correct, "score": float(question.score) if is_correct else 0.0}
    return {"is_correct": None, "score": None}


@router.get("/{exam_id}/public", response_model=ExamForTakingOut)
def get_published_exam_for_taking(exam_id: int, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.is_published == True).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found or not published")
    questions = (
        db.query(Question)
        .filter(Question.exam_id == exam.id)
        .order_by(Question.order_index.asc())
        .all()
    )
    # Build student-safe payload
    q_payload: List[QuestionStudentOut] = []
    for q in questions:
        opts: Optional[List[QuestionOptionStudentOut]] = None
        if q.type in {QuestionType.single_choice, QuestionType.multiple_choice, QuestionType.true_false}:
            opts = [
                QuestionOptionStudentOut(id=o.id, text=o.text, order_index=o.order_index)
                for o in sorted(q.options, key=lambda x: x.order_index)
            ]
        q_payload.append(
            QuestionStudentOut(
                id=q.id,
                type=q.type,
                content=q.content,
                score=float(q.score),
                order_index=q.order_index,
                options=opts,
            )
        )
    return ExamForTakingOut(id=exam.id, title=exam.title, description=exam.description, questions=q_payload)


@router.post("/{exam_id}/join/{code}")
def join_exam(exam_id: int, code: str, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.is_published == True).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found or not published")
    exam_code = db.query(ExamCode).filter(ExamCode.exam_id == exam_id, ExamCode.code == code, ExamCode.is_used == False).first()
    if not exam_code:
        raise HTTPException(status_code=400, detail="Invalid or used code")
    # Reserve code for this submission
    submission = Submission(exam_id=exam.id)
    db.add(submission)
    exam_code.is_used = True
    db.commit()
    db.refresh(submission)
    return {"submission_id": submission.id}


@router.post("/{exam_id}/submissions/{submission_id}/submit")
def submit_answers(exam_id: int, submission_id: int, payload: SubmitRequest, db: Session = Depends(get_db)):
    submission = db.query(Submission).filter(Submission.id == submission_id, Submission.exam_id == exam_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    questions: List[Question] = db.query(Question).filter(Question.exam_id == exam_id).order_by(Question.order_index.asc()).all()
    qid_to_question = {q.id: q for q in questions}

    total_score = 0.0
    for ans in payload.answers:
        question = qid_to_question.get(ans.question_id)
        if not question:
            continue
        grading = _grade_question(question, ans.model_dump())
        answer = Answer(
            submission_id=submission.id,
            question_id=question.id,
            selected_option_ids=ans.selected_option_ids,
            text_answer=ans.text_answer,
            is_correct=grading["is_correct"],
            score=grading["score"],
        )
        db.add(answer)
        if grading["score"] is not None:
            total_score += grading["score"]
    submission.submitted_at = datetime.utcnow()
    submission.total_score = total_score
    db.commit()
    return {"total_score": total_score}
