from __future__ import annotations

import os
import uuid

from flask import current_app
from PIL import Image, UnidentifiedImageError

ALLOWED_FORMATS = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp"}
MAX_DIMENSION = 2000


class InvalidImageError(ValueError):
    pass


def _catalogo_dir() -> str:
    path = os.path.join(current_app.static_folder, "uploads", "catalogo")
    os.makedirs(path, exist_ok=True)
    return path


def save_product_image(file_storage) -> str:
    """Valida, re-codifica y guarda una imagen de producto.

    No confia en la extension ni el content-type declarados por el navegador:
    abre el archivo con Pillow, verifica que sea una imagen real, la
    redimensiona si hace falta y la vuelve a guardar desde cero para
    eliminar metadatos o payloads escondidos en el archivo original.
    Devuelve la ruta relativa a app/static/ para usar con url_for('static', ...).
    """
    try:
        image = Image.open(file_storage.stream)
        image.verify()
    except (UnidentifiedImageError, OSError) as exc:
        raise InvalidImageError("El archivo no es una imagen valida.") from exc

    file_storage.stream.seek(0)
    image = Image.open(file_storage.stream)
    original_format = image.format
    if original_format not in ALLOWED_FORMATS:
        raise InvalidImageError("Formato no permitido. Usa JPG, PNG o WEBP.")

    image = image.convert("RGBA") if original_format == "PNG" else image.convert("RGB")
    image.thumbnail((MAX_DIMENSION, MAX_DIMENSION))

    extension = ALLOWED_FORMATS[original_format]
    filename = f"{uuid.uuid4().hex}.{extension}"
    destination = os.path.join(_catalogo_dir(), filename)
    image.save(destination, format=original_format, optimize=True)

    return f"uploads/catalogo/{filename}"
