from fastapi import APIRouter, Depends, HTTPException

from app.modules.usuarios.security import require_role
from app.modules.categoria.services import NombreDuplicado, RecursoNoEncontrado
from .schemas import CategoriaCreate, CategoriaRead
from .services import CategoriaService

router = APIRouter(prefix='/categorias', tags=['categorias'])
admin = Depends(require_role(['admin']))


def ejecutar(action, *args):
    try:
        return action(*args)
    except RecursoNoEncontrado as error:
        raise HTTPException(404, str(error)) from error
    except NombreDuplicado as error:
        raise HTTPException(409, str(error)) from error


@router.get('', response_model=list[CategoriaRead])
def listar(service: CategoriaService = Depends()):
    return service.listar()


@router.get('/{id}', response_model=CategoriaRead)
def detalle(id: int, service: CategoriaService = Depends()):
    return ejecutar(service.detalle, id)


@router.post('', response_model=CategoriaRead, status_code=201, dependencies=[admin])
def crear(data: CategoriaCreate, service: CategoriaService = Depends()):
    return ejecutar(service.crear, data)


@router.put('/{id}', response_model=CategoriaRead, dependencies=[admin])
def editar(id: int, data: CategoriaCreate, service: CategoriaService = Depends()):
    return ejecutar(service.actualizar, id, data)


@router.delete('/{id}', status_code=204, dependencies=[admin])
def eliminar(id: int, service: CategoriaService = Depends()):
    ejecutar(service.eliminar, id)

