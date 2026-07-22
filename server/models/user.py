from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    google_id: str = Field(unique=True, index=True)  # GoogleのIDトークンのsubクレーム
    email: str = Field(unique=True)
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    balance: Decimal = Field(default=Decimal("0.00"), max_digits=10, decimal_places=2)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
