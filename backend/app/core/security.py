from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from .settings import settings

ACCESS_TOKEN_COOKIE = 'access_token'
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes
passwords = CryptContext(schemes=['bcrypt'], bcrypt__truncate_error=True)


def hash_password(password: str) -> str:
    return passwords.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return len(password.encode('utf-8')) <= 72 and passwords.verify(password, hashed_password)


def create_access_token(subject: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({'sub': subject, 'exp': expires_at}, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None
