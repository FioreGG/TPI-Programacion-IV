from typing import Generic, TypeVar
from sqlmodel import Session, SQLModel, select

Model = TypeVar('Model', bound=SQLModel)

class Repository(Generic[Model]):
    """Acceso a datos: flush asigna IDs, el UoW confirma la transacción."""
    def __init__(self, session: Session, model: type[Model]):
        self.session = session
        self.model = model

    def get_by_id(self, id: int):
        return self.session.get(self.model, id)

    def create(self, item: Model):
        self.session.add(item)
        self.session.flush()
        return item

    def list(self):
        return self.session.exec(select(self.model)).all()
