import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class WithdrawalCreate(BaseModel):
    yape_phone: str
    amount: Decimal


class WithdrawalRead(BaseModel):
    id: uuid.UUID
    yape_phone: str
    amount: Decimal
    status: str
    created_at: datetime


class WithdrawalList(BaseModel):
    withdrawals: list[WithdrawalRead]
