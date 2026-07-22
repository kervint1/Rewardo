import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlmodel import Field, SQLModel


class Withdrawal(SQLModel, table=True):
    __tablename__ = "withdrawals"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    yape_phone: str = Field(max_length=9)
    points: int  # 消費ポイント数
    amount_soles: Decimal = Field(max_digits=10, decimal_places=2)  # Yapeで送金する額(S/)
    status: str = Field(default="pending")  # pending / completed / rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
