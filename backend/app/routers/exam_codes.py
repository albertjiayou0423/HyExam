import csv
import io
import secrets
import string
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Exam, ExamCode, User, UserRole
from ..schemas import GenerateCodesRequest
from ..security import require_roles


router = APIRouter()


def _generate_code(length: int) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


@router.post("/{exam_id}/codes/generate")
def generate_codes(exam_id: int, payload: GenerateCodesRequest, db: Session = Depends(get_db), current_user: User = Depends(require_roles([UserRole.teacher, UserRole.admin]))):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.owner_id == current_user.id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    created = []
    for _ in range(payload.count):
        code = _generate_code(payload.length)
        while db.query(ExamCode).filter(ExamCode.code == code).first() is not None:
            code = _generate_code(payload.length)
        ec = ExamCode(exam_id=exam.id, code=code)
        db.add(ec)
        created.append(code)
    db.commit()
    return {"created": created, "count": len(created)}


@router.get("/{exam_id}/codes/export.csv")
def export_codes_csv(exam_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_roles([UserRole.teacher, UserRole.admin]))):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.owner_id == current_user.id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    codes: List[ExamCode] = db.query(ExamCode).filter(ExamCode.exam_id == exam.id).order_by(ExamCode.id.asc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["exam_id", "code", "is_used"])  # minimal CSV as requested
    for c in codes:
        writer.writerow([exam.id, c.code, "1" if c.is_used else "0"])
    csv_data = output.getvalue()
    output.close()
    return Response(content=csv_data, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=hyexam_{exam.id}_codes.csv"})
