from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from database import get_session
from errors import ApiError
from models import User
from services.auth_service import AuthService

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: Session = Depends(get_session),
) -> User:
    if credentials is None:
        raise ApiError(401, "UNAUTHORIZED", "Inicia sesión para continuar")
    payload = AuthService.verify_token(credentials.credentials)
    if payload is None:
        raise ApiError(401, "INVALID_TOKEN", "Sesión inválida o expirada")
    user = session.get(User, int(payload["sub"]))
    if user is None:
        raise ApiError(401, "USER_NOT_FOUND", "Usuario no encontrado")
    return user
