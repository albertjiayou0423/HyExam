from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="community")  # admin, teacher, student, community
    avatar = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    created_exams = relationship("Exam", back_populates="creator")
    exam_attempts = relationship("ExamAttempt", back_populates="user")

class Exam(Base):
    __tablename__ = "exams"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    time_limit = Column(Integer, nullable=True)  # in minutes
    is_public = Column(Boolean, default=False)
    allow_review = Column(Boolean, default=True)
    shuffle_questions = Column(Boolean, default=False)
    shuffle_options = Column(Boolean, default=False)
    status = Column(String, default="draft")  # draft, published, archived
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(String, ForeignKey("users.id"), nullable=False)

    # Relationships
    creator = relationship("User", back_populates="created_exams")
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")
    sessions = relationship("ExamSession", back_populates="exam", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=generate_uuid)
    exam_id = Column(String, ForeignKey("exams.id"), nullable=False)
    type = Column(String, nullable=False)  # single_choice, multiple_choice, true_false, fill_blank
    content = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)  # For choice questions
    correct_answer = Column(String, nullable=False)  # JSON string for multiple answers
    points = Column(Integer, default=1)
    explanation = Column(Text, nullable=True)
    order = Column(Integer, default=0)

    # Relationships
    exam = relationship("Exam", back_populates="questions")

class ExamSession(Base):
    __tablename__ = "exam_sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    exam_id = Column(String, ForeignKey("exams.id"), nullable=False)
    exam_code = Column(String, unique=True, index=True, nullable=False)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    max_attempts = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String, ForeignKey("users.id"), nullable=False)

    # Relationships
    exam = relationship("Exam", back_populates="sessions")
    attempts = relationship("ExamAttempt", back_populates="session", cascade="all, delete-orphan")

class ExamAttempt(Base):
    __tablename__ = "exam_attempts"

    id = Column(String, primary_key=True, default=generate_uuid)
    exam_id = Column(String, ForeignKey("exams.id"), nullable=False)
    exam_session_id = Column(String, ForeignKey("exam_sessions.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    answers = Column(JSON, nullable=False)  # {question_id: answer}
    score = Column(Float, nullable=True)
    total_points = Column(Float, nullable=True)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    submit_time = Column(DateTime(timezone=True), nullable=True)
    is_submitted = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="exam_attempts")
    session = relationship("ExamSession", back_populates="attempts")

class Class(Base):
    __tablename__ = "classes"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    teacher_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ClassStudent(Base):
    __tablename__ = "class_students"

    id = Column(String, primary_key=True, default=generate_uuid)
    class_id = Column(String, ForeignKey("classes.id"), nullable=False)
    student_id = Column(String, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())