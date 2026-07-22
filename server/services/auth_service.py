from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt

import config


class AuthService:
    """自前JWTの発行・検証（FarmMatchのauth_serviceを流用）"""

    @classmethod
    def create_access_token(cls, user_id: int, google_id: str) -> str:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        to_encode = {
            "sub": str(user_id),
            "google_id": google_id,
            "exp": expire,
        }
        return jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)

    @classmethod
    def verify_token(cls, token: str) -> Optional[dict]:
        try:
            return jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
        except JWTError:
            return None
