from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User
from schemas import User as UserSchema, UserCreate, UserUpdate
from dependencies import get_admin_user
from auth import get_password_hash

router = APIRouter()

@router.get("/users", response_model=List[UserSchema])
async def get_all_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    users = db.query(User).all()
    return [UserSchema.from_orm(user) for user in users]

@router.post("/users", response_model=UserSchema)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    # Check if email already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        role=user_data.role.value
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return UserSchema.from_orm(user)

@router.put("/users/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user fields
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "role" and value:
            setattr(user, field, value.value)
        else:
            setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return UserSchema.from_orm(user)

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    # Prevent admin from deleting themselves
    if admin_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}

@router.get("/stats")
async def get_admin_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    # Get basic statistics
    total_users = db.query(User).count()
    total_teachers = db.query(User).filter(User.role == "teacher").count()
    total_students = db.query(User).filter(User.role == "student").count()
    total_community = db.query(User).filter(User.role == "community").count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "by_role": {
                "teachers": total_teachers,
                "students": total_students,
                "community": total_community
            }
        }
    }