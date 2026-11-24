from datetime import datetime, time, timedelta, timezone
from decimal import Decimal

from .models import DetallePedido, Pedido, utc_now
from .schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .unit_of_work import PedidoUnitOfWork


class RecursoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ReglaPedido(Exception):
    pass


TRANSICIONES = {
    'PENDIENTE': {'EN_PREPARACION', 'CANCELADO'},
    'EN_PREPARACION': {'ENTREGADO', 'CANCELADO'},
    'ENTREGADO': set(),
    'CANCELADO': set(),
}


class PedidoService:
    def __init__(self, uow=None):
        self.uow = uow or PedidoUnitOfWork()

    def _obtener(self, uow, id, usuario_id):
        pedido = uow.pedidos.get_by_id(id)
        if pedido is None:
            raise RecursoNoEncontrado('Pedido no encontrado')
        if usuario_id is not None and pedido.usuario_id != usuario_id:
            raise PedidoAjeno('El pedido pertenece a otro usuario')
        return pedido

    def listar(self, usuario_id, estado, skip, limit):
        with self.uow as uow:
            total, items = uow.pedidos.page(usuario_id, estado, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in items])

    def obtener(self, id, usuario_id):
        with self.uow as uow:
            return PedidoRead.model_validate(self._obtener(uow, id, usuario_id))

    def crear(self, data: PedidoCreate, usuario_id: int):
        ids = {item.producto_id for item in data.items}
        if len(ids) != len(data.items):
            raise ReglaPedido('Un producto no puede repetirse')
        with self.uow as uow:
            pedido = Pedido(usuario_id=usuario_id, **data.model_dump(exclude={'items'}))
            total = Decimal('0')
            for item in sorted(data.items, key=lambda item: item.producto_id):
                producto = uow.productos.descontar(item.producto_id, item.cantidad)
                if producto is None:
                    actual = uow.productos.get_by_id(item.producto_id)
                    if actual is None or not actual.activo:
                        raise RecursoNoEncontrado(f'Producto {item.producto_id} no encontrado')
                    if not actual.disponible:
                        raise ReglaPedido(f'Producto {actual.nombre} no disponible')
                    raise ReglaPedido(f'Stock insuficiente para {actual.nombre}')
                subtotal = Decimal(str(producto.precio_base)) * item.cantidad
                pedido.items.append(DetallePedido(
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=float(subtotal),
                ))
                total += subtotal
            pedido.total = float(total)
            uow.pedidos.create(pedido)
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, id, estado, usuario_id=None):
        with self.uow as uow:
            pedido = self._obtener(uow, id, usuario_id)
            anterior = pedido.estado
            if estado not in TRANSICIONES[anterior] or (usuario_id is not None and anterior != 'PENDIENTE'):
                raise ReglaPedido('Transición de estado inválida')
            if not uow.pedidos.cambiar_estado(id, anterior, estado, utc_now()):
                raise ReglaPedido('El estado del pedido cambió')
            if estado == 'CANCELADO':
                for item in sorted(pedido.items, key=lambda item: item.producto_id):
                    uow.productos.restituir(item.producto_id, item.cantidad)
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def resumen(self):
        zona = timezone(timedelta(hours=-3))
        inicio = datetime.combine(datetime.now(zona).date(), time.min, zona).astimezone(timezone.utc)
        with self.uow as uow:
            counts, hoy, ingresos = uow.pedidos.resumen(inicio, inicio + timedelta(days=1))
            return ResumenPedidos(
                pendientes=counts.get('PENDIENTE', 0),
                en_preparacion=counts.get('EN_PREPARACION', 0),
                entregados=counts.get('ENTREGADO', 0),
                cancelados=counts.get('CANCELADO', 0),
                pedidos_hoy=hoy,
                ingresos_entregados=ingresos,
            )
