"""Estado de stock: es la regla detras del aviso "solo quedan N" del catalogo."""

from app.models import Product


def _producto(stock, umbral=5):
    return Product(name="x", slug="x", description="d", category_id=1,
                   stock=stock, low_stock_threshold=umbral)


def test_agotado_cuando_no_queda_nada():
    assert _producto(0).stock_status == "agotado"


def test_agotado_tambien_si_el_stock_quedo_negativo():
    assert _producto(-2).stock_status == "agotado"


def test_bajo_justo_en_el_umbral():
    assert _producto(5, umbral=5).stock_status == "bajo"


def test_bajo_por_debajo_del_umbral():
    assert _producto(1, umbral=5).stock_status == "bajo"


def test_normal_por_encima_del_umbral():
    assert _producto(6, umbral=5).stock_status == "normal"
