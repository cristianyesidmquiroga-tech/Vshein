"""Subida de imagenes: es la unica via por la que entra un archivo al servidor."""

import io
import os

import pytest
from PIL import Image

from app.uploads import InvalidImageError, save_product_image


@pytest.fixture(autouse=True)
def _limpiar_archivos(app):
    """Borra lo que cada prueba haya escrito: no deben quedar restos en disco."""
    carpeta = os.path.join(app.static_folder, "uploads", "catalogo")
    antes = set(os.listdir(carpeta)) if os.path.isdir(carpeta) else set()
    yield
    if os.path.isdir(carpeta):
        for nombre in set(os.listdir(carpeta)) - antes:
            os.remove(os.path.join(carpeta, nombre))


class _Archivo:
    """Imita el FileStorage de Werkzeug: solo se usa .stream y .filename."""

    def __init__(self, data, filename):
        self.stream = io.BytesIO(data)
        self.filename = filename


def _imagen(formato, tamano=(40, 40)):
    buffer = io.BytesIO()
    Image.new("RGB", tamano, (200, 120, 160)).save(buffer, format=formato)
    return buffer.getvalue()


def test_rechaza_un_archivo_que_no_es_imagen(app):
    falso = _Archivo(b"<?php system($_GET['c']); ?>", "prenda.jpg")
    with pytest.raises(InvalidImageError):
        save_product_image(falso)


def test_rechaza_un_formato_de_imagen_no_permitido(app):
    with pytest.raises(InvalidImageError):
        save_product_image(_Archivo(_imagen("BMP"), "prenda.bmp"))


def test_acepta_jpeg_y_devuelve_ruta_relativa(app):
    ruta = save_product_image(_Archivo(_imagen("JPEG"), "prenda.jpg"))
    assert ruta.startswith("uploads/catalogo/")
    assert ruta.endswith(".jpg")


def test_renombra_el_archivo_y_no_conserva_el_nombre_original(app):
    ruta = save_product_image(_Archivo(_imagen("JPEG"), "../../etc/passwd.jpg"))
    assert "passwd" not in ruta
    assert ".." not in ruta


def test_reduce_las_imagenes_demasiado_grandes(app):
    ruta = save_product_image(_Archivo(_imagen("JPEG", (3200, 2400)), "grande.jpg"))
    destino = os.path.join(app.static_folder, *ruta.split("/"))
    with Image.open(destino) as guardada:
        assert max(guardada.size) <= 2000
