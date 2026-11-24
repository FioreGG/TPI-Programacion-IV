from fastapi import Depends, HTTPException, Request
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import ACCESS_TOKEN_COOKIE, decode_access_token
from .models import Usuario


def get_current_user(request: Request, session: Session = Depends(get_session)) -> Usuario:
    token = request.cookies.get(ACCESS_TOKEN_COOKIE)
    payload = decode_access_token(token) if token else None
    subject = payload.get('sub') if payload else None
    if isinstance(subject, str) and subject.isdecimal():
        usuario = session.get(Usuario, int(subject))
        if usuario is not None:
            return usuario
    raise HTTPException(401, 'Iniciá sesión para continuar')


def get_current_active_user(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    if usuario.disabled:
        raise HTTPException(400, 'Cuenta de usuario desactivada')
    return usuario


def require_role(required_roles: list[str]):
    def check_role(usuario: Usuario = Depends(get_current_active_user)) -> Usuario:
        if usuario.role not in required_roles:
            raise HTTPException(403, 'Acceso denegado')
        return usuario
    return check_role
