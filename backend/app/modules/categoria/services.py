from sqlalchemy.exc import IntegrityError

from .model import Categoria
from .schemas import CategoriaRead
from .unit_of_work import CategoriaUnitOfWork


class RecursoNoEncontrado(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self):
        self.uow = CategoriaUnitOfWork()

    def buscar(self, repo, id):
        registro = repo.get_by_id(id)
        if registro is None or not registro.activo:
            raise RecursoNoEncontrado('Recurso no encontrado')
        return registro

    def listar(self):
        with self.uow as uow:
            registros = uow.session.exec(uow.categorias.activos().order_by(Categoria.nombre)).all()
            return [CategoriaRead.model_validate(c) for c in registros]

    def detalle(self, id):
        with self.uow as uow:
            return CategoriaRead.model_validate(self.buscar(uow.categorias, id))

    def crear(self, data):
        try:
            with self.uow as uow:
                registro = uow.categorias.create(Categoria(**data.model_dump()))
                return CategoriaRead.model_validate(registro)
        except IntegrityError as error:
            raise NombreDuplicado('Ya existe una categoría con ese nombre') from error

    def actualizar(self, id, data):
        try:
            with self.uow as uow:
                registro = self.buscar(uow.categorias, id)
                registro.sqlmodel_update(data.model_dump())
                return CategoriaRead.model_validate(registro)
        except IntegrityError as error:
            raise NombreDuplicado('Ya existe una categoría con ese nombre') from error

    def eliminar(self, id):
        with self.uow as uow:
            self.buscar(uow.categorias, id).activo = False
