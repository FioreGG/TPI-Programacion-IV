from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm

from app.core.security import ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.security import get_current_active_user
from . import service

router = APIRouter(prefix='/auth', tags=['autenticación'])


@router.post('/register', response_model=UserPublic, status_code=201)
def registrar(data: UserCreate):
    return service.registrar(data)


@router.post('/token')
def login(response: Response, form: OAuth2PasswordRequestForm = Depends()):
    usuario_id = service.autenticar(form.username, form.password)
    response.set_cookie(
        ACCESS_TOKEN_COOKIE, create_access_token(str(usuario_id)),
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60, httponly=True, samesite='lax',
    )
    return {'message': 'Login exitoso'}


@router.post('/logout')
def logout(response: Response):
    response.delete_cookie(ACCESS_TOKEN_COOKIE, httponly=True, samesite='lax')
    return {'message': 'Sesión cerrada'}


@router.get('/me', response_model=UserPublic)
def me(usuario: Usuario = Depends(get_current_active_user)):
    return usuario
