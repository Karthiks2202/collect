from pydantic import BaseModel, EmailStr
from typing import Optional


class ProfileUpdate(BaseModel):
    email: EmailStr
    username: str


class ChangePassword(BaseModel):
    old_password: str
    new_password: str


class PreferenceCreate(BaseModel):
    genre: str