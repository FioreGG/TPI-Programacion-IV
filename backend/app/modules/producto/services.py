from app.modules.categoria.services import RecursoNoEncontrado
from .model import Producto
from .schemas import ProductoRead, ProductosPaginados
from .unit_of_work import ProductoUnitOfWork


class ProductoService:
    def __init__(self):
        self.uow = ProductoUnitOfWork()

    def buscar(self, repo, id):
        registro = repo.get_by_id(id)
        if registro is None or not registro.activo:
            raise RecursoNoEncontrado('Recurso no encontrado')
        return registro

    def listar(self, skip, limit, search, categoria_id, disponible):
        with self.uow as uow:
            total, items = uow.productos.page(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in items])

    def detalle(self, id):
        with self.uow as uow:
            return ProductoRead.model_validate(self.buscar(uow.productos, id))

    def crear(self, data):
        with self.uow as uow:
            self.buscar(uow.categorias, data.categoria_id)
            registro = uow.productos.create(Producto(**data.model_dump()))
            return ProductoRead.model_validate(registro)

    def actualizar(self, id, data):
        with self.uow as uow:
            registro = self.buscar(uow.productos, id)
            cambios = data.model_dump(exclude_unset=True)
            if 'categoria_id' in cambios:
                registro.categoria = self.buscar(uow.categorias, cambios.pop('categoria_id'))
            registro.sqlmodel_update(cambios)
            uow.session.flush()
            return ProductoRead.model_validate(registro)

    def eliminar(self, id):
        with self.uow as uow:
            self.buscar(uow.productos, id).activo = False
