from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from database import get_session
from dependencies import get_current_user
from models import Postback, User
from schemas.postback import PostbackList, PostbackRead

router = APIRouter(prefix="/api/v1/postbacks", tags=["postbacks"])


@router.get("", response_model=PostbackList)
def list_postbacks(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    rows = session.exec(
        select(Postback)
        .where(Postback.user_id == user.id)
        .order_by(Postback.created_at.desc())
    ).all()
    return PostbackList(
        postbacks=[PostbackRead.model_validate(r, from_attributes=True) for r in rows]
    )
