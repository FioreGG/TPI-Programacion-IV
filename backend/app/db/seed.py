from sqlmodel import Session, select

from app.core.database import create_tables, engine
from app.core.security import hash_password
from app.modules.categoria.model import Categoria
from app.modules.producto.model import Producto
from app.modules.usuarios.models import Usuario

CATALOGO = {
    'Hamburguesas': [('Clásica', 8500), ('Doble cheddar', 10500), ('Vegetal', 9000)],
    'Pizzas': [('Muzzarella', 11000), ('Napolitana', 12500), ('Fugazzeta', 13200)],
    'Acompañamientos': [('Papas fritas', 4500), ('Aros de cebolla', 4900)],
}


def seed():
    create_tables()
    with Session(engine) as session, session.begin():
        if session.exec(select(Usuario).where(Usuario.username == 'admin')).first() is None:
            session.add(Usuario(
                username='admin', full_name='Administración Food Store',
                email='admin@foodstore.example.com', role='admin',
                hashed_password=hash_password('Admin1234!'),
            ))
        for nombre, productos in CATALOGO.items():
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre)
                session.add(categoria)
                session.flush()
            for nombre_producto, precio in productos:
                existe = session.exec(select(Producto).where(
                    Producto.categoria_id == categoria.id, Producto.nombre == nombre_producto,
                )).first()
                if existe is None:
                    session.add(Producto(
                        categoria_id=categoria.id, nombre=nombre_producto,
                        precio_base=precio, stock=20,
                    ))


if __name__ == '__main__':
    seed()
