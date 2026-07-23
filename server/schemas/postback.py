import uuid
from datetime import datetime

from pydantic import BaseModel


class PostbackRead(BaseModel):
    id: uuid.UUID
    reward_points: int
    created_at: datetime


class PostbackList(BaseModel):
    postbacks: list[PostbackRead]
