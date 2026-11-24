from fastapi import APIRouter, Depends, HTTPException, Query

from app.modules.usuarios.security import require_role
from app.modules.categoria.services import NombreDuplicado, RecursoNoEncontrado
from .schemas import ProductoCreate, ProductoRead, ProductosPaginados, ProductoUpdate, ProductoStockUpdate
from .services import ProductoService

router = APIRouter(prefix='/productos', tags=['productos'])
admin = Depends(require_role(['admin']))


def ejecutar(action, *args):
    try:
        return action(*args)
    except RecursoNoEncontrado as error:
        raise HTTPException(404, str(error)) from error
    except NombreDuplicado as error:
        raise HTTPException(409, str(error)) from error


@router.get('', response_model=ProductosPaginados)
def listar(service: ProductoService = Depends(), skip: int = Query(0, ge=0),
           limit: int = Query(20, ge=1, le=100), search: str = '', categoria_id: int | None = None,
           disponible: bool | None = None):
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get('/{id}', response_model=ProductoRead)
def detalle(id: int, service: ProductoService = Depends()):
    return ejecutar(service.detalle, id)


@router.post('', response_model=ProductoRead, status_code=201, dependencies=[admin])
def crear(data: ProductoCreate, service: ProductoService = Depends()):
    return ejecutar(service.crear, data)


@router.put('/{id}', response_model=ProductoRead, dependencies=[admin])
def editar(id: int, data: ProductoUpdate, service: ProductoService = Depends()):
    return ejecutar(service.actualizar, id, data)


@router.delete('/{id}', status_code=204, dependencies=[admin])
def eliminar(id: int, service: ProductoService = Depends()):
    ejecutar(service.eliminar, id)


@router.patch('/{id}/stock', response_model=ProductoRead, dependencies=[admin])
def cambiar_stock(id: int, data: ProductoStockUpdate, service: ProductoService = Depends()):
    return ejecutar(service.actualizar, id, data)
