from sqlmodel import select
from sqlalchemy import func, update

from app.core.repository import Repository
from .model import Producto


class ProductoRepository(Repository[Producto]):
    def __init__(self, session):
        super().__init__(session, Producto)

    def activos(self):
        return select(Producto).where(Producto.activo.is_(True))

    def page(self, skip, limit, search, categoria_id, disponible):
        query = self.activos()
        if search:
            query = query.where(Producto.nombre.icontains(search, autoescape=True))
        if categoria_id is not None:
            query = query.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            query = query.where(Producto.disponible == disponible)
        total = self.session.exec(select(func.count()).select_from(query.subquery())).one()
        items = self.session.exec(query.order_by(Producto.id).offset(skip).limit(limit)).all()
        return total, items

    def descontar(self, id, cantidad):
        statement = update(Producto).where(
            Producto.id == id,
            Producto.activo.is_(True),
            Producto.disponible.is_(True),
            Producto.stock >= cantidad,
        ).values(stock=Producto.stock - cantidad).returning(Producto)
        return self.session.execute(statement).scalar_one_or_none()

    def restituir(self, id, cantidad):
        self.session.exec(update(Producto).where(Producto.id == id).values(
            stock=Producto.stock + cantidad
        ))

