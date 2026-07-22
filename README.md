# Vshein

Base Flask para una tienda de ropa femenina con:

- Landing page de una sola vista
- Seccion de productos con imagenes y videos
- Seccion "Quienes somos"
- Seccion de contacto
- Footer con politicas, terminos y condiciones
- Panel de administracion con login y roles
- Inventario con filtros, CRUD y alertas de stock

## Estructura

- `app/`: aplicacion Flask, modelos, rutas, templates y assets
- `instance/`: configuracion local para desarrollo
- `static/`: archivos publicos
- `templates/`: vistas Jinja

## Nota importante sobre MySQL

La carpeta `instance/` no guarda la base de datos como archivo. En Flask se usa para configuracion local y secretos.
La base de datos vive en tu servidor MySQL, y desde `instance/config.py` se define la cadena de conexion.

## Siguientes pasos

1. Crear `instance/config.py`
2. Configurar MySQL local
3. Ejecutar `python run.py`

