from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.models.user import User
from src.core.dependencies import get_current_user

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
        "email": current_user.email
    }