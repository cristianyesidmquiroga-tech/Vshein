# Vshein

<details>
<summary><b>Read this in English</b></summary>

Flask base for a women's clothing store:

- One-page landing rendered from the real database, with product images and videos, an "About us" section, contact and a footer with policies and terms.
- Admin panel with login and two roles (`admin` and `empleado`) under a non-obvious path (`ADMIN_PATH_PREFIX`).
- Inventory with filters, product CRUD, stock movements and low-stock alerts.

Quick start: copy `.env.example` to `.env` and fill `SECRET_KEY` and `DATABASE_URL`, then run `pip install -r requirements.txt`, `python -m flask db upgrade`, `python -m flask seed-demo-data` (only with `SEED_DEMO_DATA=true`) and `python run.py`. Tests: `pip install -r requirements-dev.txt` and `pytest` (19 tests).

</details>

Base Flask para una tienda de ropa femenina:

- Landing de una sola vista, armada con los datos reales de la base: productos con imágenes y videos, "Quiénes somos", contacto y footer con políticas y términos.
- Panel administrativo con login y dos roles (`admin` y `empleado`) en una ruta no obvia (`ADMIN_PATH_PREFIX`).
- Inventario con filtros, CRUD de productos, movimientos de stock y alertas de stock bajo.

## Estructura

- `app/`: aplicación Flask, modelos, rutas (`main`, `auth`, `admin`), plantillas y archivos estáticos.
- `config/`: configuración; todo sale de variables de entorno.
- `data/`: base SQLite local de desarrollo (no se versiona).
- `migrations/`: migraciones de esquema con Flask-Migrate.
- `tests/`: 19 pruebas con pytest.

## Configuración

Copiar `.env.example` a `.env` y completar los valores. Cada variable está explicada en ese archivo.

| Variable | Obligatoria | Para qué sirve |
|---|:-:|---|
| `SECRET_KEY` | sí | Firma la cookie de sesión. |
| `DATABASE_URL` | sí | Conexión a la base. En local: `sqlite:///data/dev.sqlite3`. |
| `ADMIN_PATH_PREFIX` | no (`equipo-sv`) | Prefijo de las rutas del login y del panel. |
| `SEED_DEMO_DATA` | no (`false`) | `true` solo en local, para poder correr `flask seed-demo-data`. |
| `FLASK_ENV` | no (`production`) | `development` en local (cookies sin `Secure`). |

Si falta `SECRET_KEY` o `DATABASE_URL` la app no arranca, en vez de usar un valor inseguro.

## Primer arranque

```
pip install -r requirements.txt
python -m flask db upgrade
python -m flask seed-demo-data
python run.py
```

## Pruebas

```
pip install -r requirements-dev.txt
pytest
```

## Cambios de esquema

La base no se borra ni se recrea. Cada cambio de modelos va en una migración nueva:

```
python -m flask db migrate -m "descripcion del cambio"
python -m flask db upgrade
```
