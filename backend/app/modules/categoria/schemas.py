from sqlmodel import Field, SQLModel


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str = ''


class CategoriaRead(CategoriaCreate):
    id: int
    activo: bool
