from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / '.env', extra='ignore'
    )
    database_url: str
    secret_key: str = Field(min_length=32)
    algorithm: str = 'HS256'
    access_token_expire_minutes: int = Field(default=30, gt=0)
    frontend_origin: str = 'http://localhost:5173'


settings = Settings()
