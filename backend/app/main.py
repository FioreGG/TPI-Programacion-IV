from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.settings import settings
from app.modules.auth.router import router as auth_router
from app.modules.categoria.routers import router as categoria_router
from app.modules.pedidos.router import router as pedido_router
from app.modules.producto.routers import router as producto_router
from app.modules.usuarios.routers import router as usuario_router


def create_app():
    app = FastAPI(title='Food Store')
    app.add_middleware(
        CORSMiddleware, allow_origins=[settings.frontend_origin],
        allow_credentials=True, allow_methods=['*'], allow_headers=['*'],
    )
    for router in (auth_router, categoria_router, producto_router, pedido_router, usuario_router):
        app.include_router(router, prefix='/api/v1')
    return app


app = create_app()
