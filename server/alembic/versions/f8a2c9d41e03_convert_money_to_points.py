"""convert money to points

現金額(DECIMAL)の保持をやめ、整数ポイント制に移行する（規約対応）。
既存データは 1,000 pts = S/ 1 のレートで換算する。

Revision ID: f8a2c9d41e03
Revises: d1417bb19687
Create Date: 2026-07-23

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'f8a2c9d41e03'
down_revision: Union[str, None] = 'd1417bb19687'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

POINTS_PER_SOL = 1000


def upgrade() -> None:
    # users: balance(DECIMAL) → points(INT)
    op.add_column('users', sa.Column('points', sa.Integer(), nullable=False, server_default='0'))
    op.execute(f"UPDATE users SET points = ROUND(balance * {POINTS_PER_SOL})")
    op.drop_column('users', 'balance')
    op.alter_column('users', 'points', server_default=None)

    # postbacks: reward_amount(DECIMAL) → reward_points(INT)
    op.add_column('postbacks', sa.Column('reward_points', sa.Integer(), nullable=False, server_default='0'))
    op.execute(f"UPDATE postbacks SET reward_points = ROUND(reward_amount * {POINTS_PER_SOL})")
    op.drop_column('postbacks', 'reward_amount')
    op.alter_column('postbacks', 'reward_points', server_default=None)

    # withdrawals: amount(DECIMAL) → points(INT) + amount_soles(DECIMAL)
    op.add_column('withdrawals', sa.Column('points', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('withdrawals', sa.Column('amount_soles', sa.Numeric(precision=10, scale=2), nullable=False, server_default='0'))
    op.execute(f"UPDATE withdrawals SET points = ROUND(amount * {POINTS_PER_SOL}), amount_soles = amount")
    op.drop_column('withdrawals', 'amount')
    op.alter_column('withdrawals', 'points', server_default=None)
    op.alter_column('withdrawals', 'amount_soles', server_default=None)


def downgrade() -> None:
    op.add_column('withdrawals', sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False, server_default='0'))
    op.execute("UPDATE withdrawals SET amount = amount_soles")
    op.drop_column('withdrawals', 'amount_soles')
    op.drop_column('withdrawals', 'points')
    op.alter_column('withdrawals', 'amount', server_default=None)

    op.add_column('postbacks', sa.Column('reward_amount', sa.Numeric(precision=10, scale=2), nullable=False, server_default='0'))
    op.execute(f"UPDATE postbacks SET reward_amount = reward_points::numeric / {POINTS_PER_SOL}")
    op.drop_column('postbacks', 'reward_points')
    op.alter_column('postbacks', 'reward_amount', server_default=None)

    op.add_column('users', sa.Column('balance', sa.Numeric(precision=10, scale=2), nullable=False, server_default='0'))
    op.execute(f"UPDATE users SET balance = points::numeric / {POINTS_PER_SOL}")
    op.drop_column('users', 'points')
    op.alter_column('users', 'balance', server_default=None)
