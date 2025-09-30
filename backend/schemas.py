from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"
    COMMUNITY = "community"

class QuestionType(str, Enum):
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    FILL_BLANK = "fill_blank"

class ExamStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.COMMUNITY

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: str
    avatar: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Auth schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(UserBase):
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

# Question schemas
class QuestionBase(BaseModel):
    type: QuestionType
    content: str
    options: Optional[List[str]] = None
    correct_answer: Union[str, List[str]]
    points: int = 1
    explanation: Optional[str] = None
    order: int = 0

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    type: Optional[QuestionType] = None
    content: Optional[str] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[Union[str, List[str]]] = None
    points: Optional[int] = None
    explanation: Optional[str] = None
    order: Optional[int] = None

class Question(QuestionBase):
    id: str
    exam_id: str

    class Config:
        from_attributes = True

# Exam schemas
class ExamBase(BaseModel):
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    time_limit: Optional[int] = None
    is_public: bool = False
    allow_review: bool = True
    shuffle_questions: bool = False
    shuffle_options: bool = False
    status: ExamStatus = ExamStatus.DRAFT

class ExamCreate(ExamBase):
    questions: List[QuestionCreate] = []

class ExamUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    time_limit: Optional[int] = None
    is_public: Optional[bool] = None
    allow_review: Optional[bool] = None
    shuffle_questions: Optional[bool] = None
    shuffle_options: Optional[bool] = None
    status: Optional[ExamStatus] = None

class Exam(ExamBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: str
    questions: List[Question] = []

    class Config:
        from_attributes = True

# Exam Session schemas
class ExamSessionBase(BaseModel):
    exam_id: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    max_attempts: Optional[int] = None

class ExamSessionCreate(ExamSessionBase):
    pass

class ExamSession(ExamSessionBase):
    id: str
    exam_code: str
    is_active: bool
    created_at: datetime
    created_by: str

    class Config:
        from_attributes = True

# Exam Attempt schemas
class ExamAttemptBase(BaseModel):
    exam_session_id: str
    answers: Dict[str, Any]

class ExamAttemptCreate(ExamAttemptBase):
    pass

class ExamAttempt(ExamAttemptBase):
    id: str
    exam_id: str
    user_id: str
    score: Optional[float] = None
    total_points: Optional[float] = None
    start_time: datetime
    submit_time: Optional[datetime] = None
    is_submitted: bool

    class Config:
        from_attributes = True

# Class schemas
class ClassBase(BaseModel):
    name: str
    description: Optional[str] = None

class ClassCreate(ClassBase):
    pass

class ClassUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class Class(ClassBase):
    id: str
    teacher_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Response schemas
class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None
    error: Optional[str] = None

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    per_page: int
    pages: int