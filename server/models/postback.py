import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlmodel import Field, SQLModel


class Postback(SQLModel, table=True):
    __tablename__ = "postbacks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    transaction_id: str = Field(unique=True, index=True)  # Monlixの取引ID（二重付与防止）
    user_id: int = Field(foreign_key="users.id")
    reward_amount: Decimal = Field(max_digits=10, decimal_places=2)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
