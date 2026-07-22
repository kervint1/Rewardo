import os
from decimal import Decimal

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/cashyape"
)
# Heroku は postgres:// 形式で渡してくるが SQLAlchemy は postgresql:// を要求する
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

MONLIX_POSTBACK_SECRET = os.getenv("MONLIX_POSTBACK_SECRET", "")
MIN_WITHDRAWAL_AMOUNT = Decimal(os.getenv("MIN_WITHDRAWAL_AMOUNT", "10.00"))

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
