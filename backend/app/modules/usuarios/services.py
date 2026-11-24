from fastapi import HTTPException

from .schemas import UserPublic
from .unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def listar(self):
        with UsuarioUnitOfWork() as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list()]

    def cambiar_estado(self, id: int, disabled: bool, admin_id: int):
        with UsuarioUnitOfWork() as uow:
            usuario = uow.usuarios.get_by_id(id)
            if usuario is None:
                raise HTTPException(404, 'Usuario no encontrado')
            if disabled and id == admin_id:
                raise HTTPException(400, 'No podés desactivar tu propia cuenta')
            usuario.disabled = disabled
            return UserPublic.model_validate(usuario)
