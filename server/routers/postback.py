import hashlib
import hmac
import logging

from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

import config
from database import get_session
from errors import ApiError
from models import Postback, User

router = APIRouter(tags=["postback"])
logger = logging.getLogger("postback")


def verify_postback_hash(userid: str, transaction_id: str, amount: str, received_hash: str | None) -> bool:
    # TODO: Monlix契約後、実際のPostback署名仕様（アルゴリズム・パラメータ順）に差し替える
    if not config.MONLIX_POSTBACK_SECRET:
        return True  # 開発中（シークレット未設定）は検証をスキップ
    expected = hashlib.sha256(
        f"{transaction_id}:{userid}:{amount}:{config.MONLIX_POSTBACK_SECRET}".encode()
    ).hexdigest()
    return hmac.compare_digest(expected, received_hash or "")


@router.get("/postback/monlix", response_class=PlainTextResponse)
def monlix_postback(
    userid: str,
    transaction_id: str,
    amount: str,
    status: str = "1",
    hash: str | None = None,
    session: Session = Depends(get_session),
):
    if not verify_postback_hash(userid, transaction_id, amount, hash):
        logger.warning("Postback signature mismatch: transaction_id=%s", transaction_id)
        raise ApiError(403, "INVALID_SIGNATURE", "Invalid signature")

    if status != "1":
        # 承認済み以外の通知は付与せず正常応答（Monlixの再送を止める）
        return "OK"

    try:
        # Monlixの仮想通貨（Coins/Points）は整数で届く
        reward_points = int(amount)
    except ValueError:
        raise ApiError(422, "INVALID_AMOUNT", "Invalid amount")
    if reward_points <= 0:
        raise ApiError(422, "INVALID_AMOUNT", "Invalid amount")

    user = session.exec(
        select(User).where(User.id == int(userid)).with_for_update()
    ).first()
    if user is None:
        logger.warning("Postback for unknown user: userid=%s", userid)
        raise ApiError(404, "USER_NOT_FOUND", "User not found")

    session.add(Postback(transaction_id=transaction_id, user_id=user.id, reward_points=reward_points))
    user.points += reward_points
    try:
        session.commit()
    except IntegrityError:
        # transaction_id重複 = 再送。処理済みなので成功として返す（冪等）
        session.rollback()
        return "OK"
    return "OK"
