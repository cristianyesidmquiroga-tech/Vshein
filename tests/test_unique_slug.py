"""unique_slug: dos prendas con el mismo nombre no pueden pisarse la URL."""

from app.bootstrap import unique_slug
from app.models import Category, Product


def _crear(db, nombre, slug):
    categoria = Category.query.first()
    if not categoria:
        categoria = Category(name="Vestidos", slug="vestidos")
        db.session.add(categoria)
        db.session.flush()
    producto = Product(name=nombre, slug=slug, description="d", category_id=categoria.id)
    db.session.add(producto)
    db.session.flush()
    return producto


def test_sin_colision_devuelve_el_slug_base(db):
    assert unique_slug(Product, "Vestido Rojo") == "vestido-rojo"


def test_con_colision_agrega_sufijo(db):
    _crear(db, "Vestido Rojo", "vestido-rojo")
    assert unique_slug(Product, "Vestido Rojo") == "vestido-rojo-2"


def test_sufijos_consecutivos_no_se_repiten(db):
    _crear(db, "Vestido Rojo", "vestido-rojo")
    _crear(db, "Vestido Rojo", "vestido-rojo-2")
    assert unique_slug(Product, "Vestido Rojo") == "vestido-rojo-3"


def test_al_editar_conserva_su_propio_slug(db):
    producto = _crear(db, "Vestido Rojo", "vestido-rojo")
    assert unique_slug(Product, "Vestido Rojo", exclude_id=producto.id) == "vestido-rojo"
