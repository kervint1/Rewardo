from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class MeResponse(BaseModel):
    id: int
    email: str
    name: Optional[str]
    avatar_url: Optional[str]
    balance: Decimal
    min_withdrawal_amount: Decimal
