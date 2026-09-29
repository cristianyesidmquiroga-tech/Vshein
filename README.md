# Vshein

Base Flask para una tienda de ropa femenina con:

- Landing page de una sola vista, renderizada desde la base de datos real
- Seccion de productos con imagenes y videos
- Seccion "Quienes somos"
- Seccion de contacto
- Footer con politicas, terminos y condiciones
- Panel de administracion con login y roles, en una ruta no obvia (ver `ADMIN_PATH_PREFIX`)
- Inventario con filtros, CRUD y alertas de stock

## Estructura

- `app/`: aplicacion Flask, modelos, rutas, templates y assets
- `config/`: configuracion de la app (unico punto de verdad, lee todo de variables de entorno)
- `data/`: base de datos SQLite local de desarrollo (nunca se versiona)
- `migrations/`: historial de migraciones de esquema (Alembic via Flask-Migrate)

## Configuracion (.env)

Este proyecto no versiona `.env.example` a proposito. Crea un archivo `.env` en la raiz
(nunca se commitea, ya esta en `.gitignore`) con estas variables:

| Variable            | Obligatoria | Descripcion                                                              |
|----------------------|:-----------:|---------------------------------------------------------------------------|
| `SECRET_KEY`          | si          | Clave aleatoria larga (`python -c "import secrets; print(secrets.token_hex(32))"`) |
| `DATABASE_URL`        | si          | Cadena de conexion. Dev: `sqlite:///data/dev.sqlite3`. Produccion futura: Postgres (`postgresql+psycopg2://usuario:clave@host:5432/vshein`) |
| `ADMIN_PATH_PREFIX`   | no (default `equipo-sv`) | Prefijo no obvio para las rutas del panel admin/login. Cambialo si crees que quedo expuesto. |
| `SEED_DEMO_DATA`      | no (default `false`)     | `true` solo en desarrollo local, para poder correr `flask seed-demo-data` |
| `FLASK_ENV`           | no (default `production`) | `development` en tu maquina local (afecta cookies seguras) |

Si falta `SECRET_KEY` o `DATABASE_URL` la app falla al arrancar con un error explicito
en vez de usar un valor por defecto inseguro.

## Primer arranque en desarrollo

```
pip install -r requirements.txt
python -m flask db upgrade
python -m flask seed-demo-data
python run.py
```

## Cambios de esquema

La base de datos **nunca se borra ni se recrea** despues del arranque inicial. Todo cambio
a los modelos se hace con una migracion nueva:

```
python -m flask db migrate -m "descripcion del cambio"
python -m flask db upgrade
```

