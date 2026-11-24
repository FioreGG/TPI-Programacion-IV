from sqlmodel import select

from app.core.repository import Repository
from .model import Categoria


class CategoriaRepository(Repository[Categoria]):
    def __init__(self, session):
        super().__init__(session, Categoria)

    def activos(self):
        return select(Categoria).where(Categoria.activo.is_(True))

    def por_nombre(self, nombre):
        return self.session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()

