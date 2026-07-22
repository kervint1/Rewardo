import re
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

import config
from database import get_session
from dependencies import get_current_user
from errors import ApiError
from models import User, Withdrawal
from schemas.withdrawal import WithdrawalCreate, WithdrawalList, WithdrawalRead

router = APIRouter(prefix="/api/v1/withdrawals", tags=["withdrawals"])

YAPE_PHONE_PATTERN = re.compile(r"^9\d{8}$")


@router.get("", response_model=WithdrawalList)
def list_withdrawals(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    rows = session.exec(
        select(Withdrawal)
        .where(Withdrawal.user_id == user.id)
        .order_by(Withdrawal.created_at.desc())
    ).all()
    return WithdrawalList(withdrawals=[WithdrawalRead.model_validate(r, from_attributes=True) for r in rows])


@router.post("", response_model=WithdrawalRead, status_code=201)
def create_withdrawal(
    body: WithdrawalCreate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not YAPE_PHONE_PATTERN.match(body.yape_phone):
        raise ApiError(422, "INVALID_PHONE", "Número de Yape inválido (9 dígitos, empieza con 9)")
    if body.points < config.MIN_WITHDRAWAL_POINTS:
        raise ApiError(422, "BELOW_MINIMUM", f"El mínimo es {config.MIN_WITHDRAWAL_POINTS:,} pts")
    if body.points % config.POINTS_PER_SOL != 0:
        # 端数ソルを発生させないため、1ソル単位でのみ換金を受け付ける
        raise ApiError(422, "INVALID_AMOUNT", f"Debe ser múltiplo de {config.POINTS_PER_SOL:,} pts")

    # 行ロックで並行申請を防ぐ
    locked_user = session.exec(
        select(User).where(User.id == user.id).with_for_update()
    ).one()

    pending = session.exec(
        select(Withdrawal).where(
            Withdrawal.user_id == user.id, Withdrawal.status == "pending"
        )
    ).first()
    if pending is not None:
        raise ApiError(409, "WITHDRAWAL_ALREADY_PENDING", "Ya tienes una solicitud en proceso")

    if body.points > locked_user.points:
        raise ApiError(422, "INSUFFICIENT_POINTS", "Puntos insuficientes")

    locked_user.points -= body.points
    withdrawal = Withdrawal(
        user_id=user.id,
        yape_phone=body.yape_phone,
        points=body.points,
        amount_soles=Decimal(body.points // config.POINTS_PER_SOL),
    )
    session.add(withdrawal)
    session.commit()
    session.refresh(withdrawal)
    return WithdrawalRead.model_validate(withdrawal, from_attributes=True)
