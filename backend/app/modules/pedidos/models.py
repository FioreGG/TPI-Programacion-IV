from datetime import datetime, timezone

from sqlmodel import Field, Relationship, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Pedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key='usuario.id', index=True)
    estado: str = Field(default='PENDIENTE', index=True)
    forma_pago: str
    direccion_entrega: str
    notas: str = ''
    total: float = 0
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    usuario: 'Usuario' = Relationship(back_populates='pedidos')
    items: list['DetallePedido'] = Relationship(back_populates='pedido')


class DetallePedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key='pedido.id', index=True)
    producto_id: int = Field(foreign_key='producto.id')
    cantidad: int = Field(ge=1)
    nombre_producto: str
    precio_unitario: float
    subtotal: float
    pedido: Pedido = Relationship(back_populates='items')
    producto: 'Producto' = Relationship(back_populates='detalles')
