from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.models.farm_field import FarmField
from src.models.user import User
from src.schemas.farm_field import FarmFieldCreate

router = APIRouter(prefix="/fields", tags=["Farm Fields"])


@router.post("/")
def create_field(field_data: FarmFieldCreate, db: Session = Depends(get_db)):
    if not db.query(User).filter(User.id == field_data.user_id).first():
        raise HTTPException(status_code=404, detail="User not found")
    field = FarmField(**field_data.model_dump())
    db.add(field)
    db.commit()
    db.refresh(field)
    return field


@router.get("/user/{user_id}")
def get_user_fields(user_id: int, db: Session = Depends(get_db)):
    return db.query(FarmField).filter(FarmField.user_id == user_id).all()
