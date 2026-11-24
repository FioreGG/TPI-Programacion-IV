from fastapi import APIRouter, Depends, HTTPException, Query

from app.modules.usuarios.models import Usuario
from app.modules.usuarios.security import get_current_active_user, require_role
from .schemas import CambioEstado, EstadoPedido, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .service import PedidoAjeno, PedidoService, RecursoNoEncontrado, ReglaPedido

router = APIRouter(prefix='/pedidos', tags=['pedidos'])
admin = Depends(require_role(['admin']))


def obtener_servicio() -> PedidoService:
    return PedidoService()


def ejecutar(operation, *args):
    try:
        return operation(*args)
    except RecursoNoEncontrado as error:
        raise HTTPException(404, str(error)) from error
    except PedidoAjeno as error:
        raise HTTPException(403, str(error)) from error
    except ReglaPedido as error:
        raise HTTPException(400, str(error)) from error


@router.get('', response_model=PedidosPaginados)
def listar(usuario: Usuario = Depends(get_current_active_user), service: PedidoService = Depends(obtener_servicio),
           estado: EstadoPedido | None = None, propios: bool = False, skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100)):
    return service.listar(usuario.id if propios or usuario.role != 'admin' else None, estado, skip, limit)


@router.get('/resumen', response_model=ResumenPedidos, dependencies=[admin])
def resumen(service: PedidoService = Depends(obtener_servicio)):
    return service.resumen()


@router.get('/{id}', response_model=PedidoRead)
def detalle(id: int, usuario: Usuario = Depends(get_current_active_user),
            service: PedidoService = Depends(obtener_servicio)):
    return ejecutar(service.obtener, id, None if usuario.role == 'admin' else usuario.id)


@router.post('', response_model=PedidoRead, status_code=201)
def crear(data: PedidoCreate, usuario: Usuario = Depends(get_current_active_user),
          service: PedidoService = Depends(obtener_servicio)):
    return ejecutar(service.crear, data, usuario.id)


@router.patch('/{id}/estado', response_model=PedidoRead, dependencies=[admin])
def cambiar_estado(id: int, data: CambioEstado, service: PedidoService = Depends(obtener_servicio)):
    return ejecutar(service.cambiar_estado, id, data.estado)


@router.patch('/{id}/cancelar', response_model=PedidoRead)
def cancelar(id: int, usuario: Usuario = Depends(get_current_active_user),
             service: PedidoService = Depends(obtener_servicio)):
    return ejecutar(service.cambiar_estado, id, 'CANCELADO', usuario.id)
