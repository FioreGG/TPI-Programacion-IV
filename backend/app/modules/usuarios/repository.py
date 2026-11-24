from sqlmodel import select

from app.core.repository import Repository
from .models import Usuario


class UsuarioRepository(Repository[Usuario]):
    def __init__(self, session):
        super().__init__(session, Usuario)

    def por_username(self, username: str):
        return self.session.exec(select(Usuario).where(Usuario.username == username)).first()
