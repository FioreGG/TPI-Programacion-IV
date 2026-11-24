from datetime import datetime

from sqlalchemy import func, update
from sqlmodel import select

from app.core.repository import Repository
from .models import Pedido


class PedidoRepository(Repository[Pedido]):
    def __init__(self, session):
        super().__init__(session, Pedido)

    def page(self, usuario_id, estado, skip, limit):
        query = select(Pedido)
        if usuario_id is not None:
            query = query.where(Pedido.usuario_id == usuario_id)
        if estado is not None:
            query = query.where(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(query.subquery())).one()
        items = self.session.exec(query.order_by(Pedido.id.desc()).offset(skip).limit(limit)).all()
        return total, items

    def cambiar_estado(self, id, anterior, estado, actualizado):
        statement = update(Pedido).where(
            Pedido.id == id, Pedido.estado == anterior,
        ).values(estado=estado, updated_at=actualizado).returning(Pedido.id)
        return self.session.exec(statement).first() is not None

    def resumen(self, inicio: datetime, fin: datetime):
        counts = dict(self.session.exec(
            select(Pedido.estado, func.count()).group_by(Pedido.estado)
        ).all())
        hoy = self.session.exec(select(func.count()).select_from(Pedido).where(
            Pedido.created_at >= inicio, Pedido.created_at < fin
        )).one()
        ingresos = self.session.exec(select(func.coalesce(func.sum(Pedido.total), 0)).where(
            Pedido.estado == 'ENTREGADO'
        )).one()
        return counts, hoy, ingresos
