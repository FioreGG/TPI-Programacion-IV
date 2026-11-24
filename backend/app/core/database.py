from sqlalchemy import event
from sqlmodel import SQLModel, Session, create_engine

from .settings import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)

if engine.dialect.name == 'sqlite':
    @event.listens_for(engine, 'connect')
    def activar_claves_foraneas(connection, _):
        connection.execute('PRAGMA foreign_keys=ON')
        connection.create_function('lower', 1, lambda value: value.casefold() if value is not None else None, deterministic=True)


def get_session():
    with Session(engine) as session:
        yield session


def create_tables():
    from app.modules.categoria import model as categoria
    from app.modules.pedidos import models as pedidos
    from app.modules.producto import model as producto
    from app.modules.usuarios import models as usuarios
    SQLModel.metadata.create_all(engine)
