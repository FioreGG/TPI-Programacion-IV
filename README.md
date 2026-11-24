# Food Store

Trabajo Práctico Integrador de Programación 4. Aplicación de pedidos de comida con FastAPI, SQLModel, React y TypeScript.

- Repositorio de GitHub: https://github.com/FioreGG/TPI-Programacion-IV.git 
- Link del Video: https://drive.google.com/file/d/1fuhWkpercLZemxxywhutalCSJZsaVddh/view?usp=sharing 

## Requisitos

- Python 3.11 a 3.13.
- Node.js 22.12 o superior compatible con Vite 8 y pnpm 10.33.0.
- PostgreSQL 15 o superior para la base de datos del proyecto. El archivo de ejemplo usa SQLite para iniciar el entorno local sin instalar un servidor de base de datos.

## Backend

Desde la raíz del proyecto, en PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python -m app.db.seed
uvicorn app.main:app --reload
```

En macOS o Linux, activá el entorno con `source .venv/bin/activate` y copiá el archivo con `cp .env.example .env`.

La API está en `http://localhost:8000/api/v1`. La documentación interactiva está en `http://localhost:8000/docs` y ReDoc en `http://localhost:8000/redoc`.

| Variable de backend | Uso |
| --- | --- |
| `DATABASE_URL` | Conexión SQLAlchemy. Para PostgreSQL, creá una base vacía y usá `postgresql://usuario:contraseña@localhost:5432/foodstore_db`. Para desarrollo local, usá `sqlite:///./foodstore.db`. |
| `SECRET_KEY` | Clave de firma de 32 caracteres como mínimo. Configurá un valor propio en el archivo local. |
| `ALGORITHM` | Algoritmo de firma del JWT. El valor de ejemplo es `HS256`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del JWT y su cookie. El valor de ejemplo es `30`. |
| `FRONTEND_ORIGIN` | Origen permitido por CORS. El valor de ejemplo es `http://localhost:5173`. |

El seed crea un administrador, tres categorías y ocho productos con stock. Puede volver a ejecutarse sobre la misma base.

- Usuario administrador: `admin`
- Contraseña de demostración: `Admin1234!`


## Frontend

En otra terminal, desde la raíz del proyecto:

```powershell
cd frontend
Copy-Item .env.example .env
pnpm install
pnpm build
pnpm dev
```

En macOS o Linux, usá `cp .env.example .env`. Abrí `http://localhost:5173`. `VITE_API_URL` apunta a la API e incluye el prefijo `/api/v1`. Usá el mismo nombre de host para ambos servidores para que el navegador envíe la cookie de sesión.

