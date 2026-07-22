import re

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
    if body.amount < config.MIN_WITHDRAWAL_AMOUNT:
        raise ApiError(422, "BELOW_MINIMUM", f"El monto mínimo es S/ {config.MIN_WITHDRAWAL_AMOUNT}")

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

    if body.amount > locked_user.balance:
        raise ApiError(422, "INSUFFICIENT_BALANCE", "Saldo insuficiente")

    locked_user.balance -= body.amount
    withdrawal = Withdrawal(
        user_id=user.id, yape_phone=body.yape_phone, amount=body.amount
    )
    session.add(withdrawal)
    session.commit()
    session.refresh(withdrawal)
    return WithdrawalRead.model_validate(withdrawal, from_attributes=True)
