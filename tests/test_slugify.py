"""Pruebas de slugify: genera las URLs publicas de cada prenda."""

from app.bootstrap import slugify


def test_minusculas_y_espacios():
    assert slugify("Vestido Elegante Blanco") == "vestido-elegante-blanco"


def test_quita_tildes_y_enie():
    assert slugify("Pantalón Piñata") == "pantalon-pinata"


def test_colapsa_separadores_repetidos():
    assert slugify("Falda  ---  Larga") == "falda-larga"


def test_sin_guiones_en_los_extremos():
    assert slugify("  ¡Blusa!  ") == "blusa"


def test_conserva_numeros():
    assert slugify("Top 90s Retro") == "top-90s-retro"
