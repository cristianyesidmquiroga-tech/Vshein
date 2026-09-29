from flask import Blueprint, render_template

from ..models import Category, Product


main_bp = Blueprint("main", __name__)

ACCESORIOS_SLUG = "accesorios"


@main_bp.route("/")
def index():
    categories = Category.query.order_by(Category.name.asc()).all()
    active_products = (
        Product.query.join(Category)
        .filter(Product.is_active.is_(True))
        .order_by(Product.featured.desc(), Product.sold_count.desc())
        .all()
    )

    ropa_categories = [c for c in categories if c.slug != ACCESORIOS_SLUG]
    ropa_products = [p for p in active_products if p.category.slug != ACCESORIOS_SLUG]
    accesorios_products = [p for p in active_products if p.category.slug == ACCESORIOS_SLUG]

    return render_template(
        "landing/index.html",
        ropa_categories=ropa_categories,
        ropa_products=ropa_products,
        accesorios_products=accesorios_products,
    )

@main_bp.route("/privacidad")
def privacidad():
    return render_template("landing/privacidad.html")

@main_bp.route("/terminos")
def terminos():
    return render_template("landing/terminos.html")

@main_bp.route("/cambios-devoluciones")
def cambios_devoluciones():
    return render_template("landing/cambios_devoluciones.html")

@main_bp.route("/cookies")
def cookies():
    return render_template("landing/cookies.html")

