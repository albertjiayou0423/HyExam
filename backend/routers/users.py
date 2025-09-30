from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User
from schemas import User as UserSchema, UserUpdate
from dependencies import get_current_user, get_admin_user

router = APIRouter()

@router.get("/profile", response_model=UserSchema)
async def get_profile(current_user: User = Depends(get_current_user)):
    return UserSchema.from_orm(current_user)

@router.put("/profile", response_model=UserSchema)
async def update_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Update user fields
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "role" and value:
            # Only admin can change roles
            if current_user.role != "admin":
                continue
            setattr(current_user, field, value.value)
        else:
            setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return UserSchema.from_orm(current_user)

@router.get("/", response_model=List[UserSchema])
async def get_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    users = db.query(User).all()
    return [UserSchema.from_orm(user) for user in users]

@router.get("/{user_id}", response_model=UserSchema)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only see their own profile unless they're admin
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserSchema.from_orm(user)