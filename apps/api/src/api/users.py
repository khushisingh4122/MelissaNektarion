from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.models.user import User
from src.core.dependencies import get_current_user
from src.schemas.user import UserProfileUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/")
def create_user(
    name: str,
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    user = User(
        name=name,
        email=email,
        password_hash=password
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email
    }
@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
    }


@router.put("/me")
def update_my_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.name = profile_data.name.strip()
    current_user.phone = profile_data.phone.strip() if profile_data.phone else None
    db.commit()
    db.refresh(current_user)

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
    }