from fastapi import APIRouter, Depends

from .models import Usuario
from .schemas import UserPublic
from .security import require_role
from .services import UsuarioService

router = APIRouter(prefix='/admin/usuarios', tags=['usuarios'])
admin = Depends(require_role(['admin']))


@router.get('', response_model=list[UserPublic], dependencies=[admin])
def listar(service: UsuarioService = Depends()):
    return service.listar()


@router.post('/{id}/activar', response_model=UserPublic)
def activar(id: int, service: UsuarioService = Depends(), usuario: Usuario = admin):
    return service.cambiar_estado(id, False, usuario.id)


@router.post('/{id}/desactivar', response_model=UserPublic)
def desactivar(id: int, service: UsuarioService = Depends(), usuario: Usuario = admin):
    return service.cambiar_estado(id, True, usuario.id)
