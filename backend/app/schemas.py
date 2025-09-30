from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

from .models import QuestionType, UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class QuestionOptionCreate(BaseModel):
    text: str
    is_correct: bool = False
    order_index: int = 0


class QuestionCreate(BaseModel):
    type: QuestionType
    content: str
    score: float = 1
    order_index: int = 0
    options: Optional[List[QuestionOptionCreate]] = None


class QuestionOptionOut(BaseModel):
    id: int
    text: str
    is_correct: bool
    order_index: int

    class Config:
        from_attributes = True


class QuestionOut(BaseModel):
    id: int
    type: QuestionType
    content: str
    score: float
    order_index: int
    options: Optional[List[QuestionOptionOut]] = None

    class Config:
        from_attributes = True


class ExamCreate(BaseModel):
    title: str
    description: Optional[str] = None
    questions: List[QuestionCreate]


class ExamOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    is_published: bool
    created_at: datetime
    questions: List[QuestionOut]

    class Config:
        from_attributes = True


class GenerateCodesRequest(BaseModel):
    count: int = Field(gt=0, le=1000, default=50)
    length: int = Field(ge=4, le=16, default=8)


class AnswerIn(BaseModel):
    question_id: int
    selected_option_ids: Optional[List[int]] = None
    text_answer: Optional[str] = None


class SubmitRequest(BaseModel):
    answers: List[AnswerIn]


class QuestionOptionStudentOut(BaseModel):
    id: int
    text: str
    order_index: int


class QuestionStudentOut(BaseModel):
    id: int
    type: QuestionType
    content: str
    score: float
    order_index: int
    options: Optional[List[QuestionOptionStudentOut]] = None


class ExamForTakingOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    questions: List[QuestionStudentOut]
