from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from db.database import get_db
from db import models, schemas
from core.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.Student])
async def read_students(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user)
):
    result = await db.execute(select(models.Student).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=schemas.Student)
async def create_student(
    student_in: schemas.StudentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_student = models.Student(**student_in.dict())
    db.add(new_student)
    await db.commit()
    await db.refresh(new_student)
    return new_student

@router.get("/{student_id}", response_model=schemas.Student)
async def read_student(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    result = await db.execute(select(models.Student).filter(models.Student.id == student_id))
    student = result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student