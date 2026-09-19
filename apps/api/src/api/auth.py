from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.models.user import User
from src.schemas.user import UserRegister, UserLogin
from src.core.security import (
    hash_password,
    verify_password,
    create_access_token
)


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    normalized_email = user_data.email.strip().lower()
    existing_user = db.query(User).filter(
        User.email == normalized_email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user = User(
        name=user_data.name,
        email=normalized_email,
        password_hash=hash_password(user_data.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User registered successfully",
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }


@router.post("/login")
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    normalized_email = user_data.email.strip().lower()
    user = db.query(User).filter(
        User.email == normalized_email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }