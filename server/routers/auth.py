from fastapi import APIRouter, Depends
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlmodel import Session, select

import config
from database import get_session
from errors import ApiError
from models import User
from schemas.auth import LoginRequest, TokenResponse
from services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, session: Session = Depends(get_session)):
    try:
        info = google_id_token.verify_oauth2_token(
            body.id_token, google_requests.Request(), config.GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise ApiError(401, "INVALID_GOOGLE_TOKEN", "Token de Google inválido")

    user = session.exec(select(User).where(User.google_id == info["sub"])).first()
    if user is None:
        user = User(
            google_id=info["sub"],
            email=info["email"],
            name=info.get("name"),
            avatar_url=info.get("picture"),
        )
        session.add(user)
    else:
        user.name = info.get("name") or user.name
        user.avatar_url = info.get("picture") or user.avatar_url
    session.commit()
    session.refresh(user)

    token = AuthService.create_access_token(user.id, user.google_id)
    return TokenResponse(access_token=token)
