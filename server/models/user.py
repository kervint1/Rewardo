from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    google_id: str = Field(unique=True, index=True)  # GoogleのIDトークンのsubクレーム
    email: str = Field(unique=True)
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    points: int = Field(default=0)  # 所持ポイント（現金額は持たない）
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
