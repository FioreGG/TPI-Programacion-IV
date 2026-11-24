from pydantic import FiniteFloat
from sqlmodel import Field, SQLModel
from app.modules.categoria.schemas import CategoriaRead


class ProductoCreate(SQLModel):
    categoria_id: int = Field(gt=0)
    nombre: str = Field(min_length=1, max_length=100)
    descripcion: str = ''
    precio_base: FiniteFloat = Field(ge=0)
    imagen_url: str = ''
    stock: int = Field(default=0, ge=0)
    disponible: bool = True


class ProductoUpdate(SQLModel):
    categoria_id: int = Field(default=None, gt=0)
    nombre: str = Field(default=None, min_length=1, max_length=100)
    descripcion: str = None
    precio_base: FiniteFloat = Field(default=None, ge=0)
    imagen_url: str = None
    stock: int = Field(default=None, ge=0)
    disponible: bool = None


class ProductoStockUpdate(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool


class ProductoRead(ProductoCreate):
    id: int
    activo: bool
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
