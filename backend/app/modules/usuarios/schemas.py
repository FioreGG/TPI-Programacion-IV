from datetime import datetime
from typing import Annotated, Literal

from pydantic import EmailStr, StringConstraints, field_validator
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    username: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=80, pattern=r'^[a-zA-Z0-9_.-]+$')]
    full_name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=160)]
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator('password')
    @classmethod
    def validar_password(cls, value: str) -> str:
        if len(value.encode('utf-8')) > 72:
            raise ValueError('La contraseña debe ocupar como máximo 72 bytes')
        return value


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: EmailStr
    role: Literal['user', 'admin']
    disabled: bool
    created_at: datetime
