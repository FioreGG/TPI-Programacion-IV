from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

from app.core.security import hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def registrar(data: UserCreate):
    try:
        with UsuarioUnitOfWork() as uow:
            usuario = uow.usuarios.create(Usuario(
                username=data.username.lower(), full_name=data.full_name.strip(),
                email=str(data.email).lower(), hashed_password=hash_password(data.password),
            ))
            return UserPublic.model_validate(usuario)
    except IntegrityError as error:
        raise HTTPException(409, 'El usuario o el email ya existe') from error


def autenticar(username: str, password: str) -> int:
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.por_username(username.strip().lower())
        if usuario is None or not verify_password(password, usuario.hashed_password):
            raise HTTPException(401, 'Usuario o contraseña incorrectos')
        if usuario.disabled:
            raise HTTPException(400, 'Cuenta de usuario desactivada')
        return usuario.id
