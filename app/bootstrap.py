from __future__ import annotations

from .extensions import db
from .models import Category, Product, ProductMedia, User


DEFAULT_CATEGORIES = [
    "Accesorios",
    "Blusas",
    "Bragas",
    "Camiseta",
    "Calzones",
    "Faldas",
    "Joyeria",
    "Pantalones",
    "Tops",
    "Vestidos",
    "Vestidos cortos",
]


def slugify(value: str) -> str:
    value = value.lower().strip()
    replacements = {
        "á": "a",
        "é": "e",
        "í": "i",
        "ó": "o",
        "ú": "u",
        "ñ": "n",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = "".join(ch if ch.isalnum() else "-" for ch in value)
    while "--" in value:
        value = value.replace("--", "-")
    return value.strip("-")


def unique_slug(model, value: str, exclude_id: int | None = None) -> str:
    base_slug = slugify(value)
    candidate = base_slug
    index = 2

    while True:
        query = model.query.filter_by(slug=candidate)
        if exclude_id is not None:
            query = query.filter(model.id != exclude_id)
        if not query.first():
            return candidate
        candidate = f"{base_slug}-{index}"
        index += 1


def seed_demo_data() -> None:
    if not Category.query.first():
        categories = []
        for name in DEFAULT_CATEGORIES:
            category = Category(name=name, slug=slugify(name))
            categories.append(category)
            db.session.add(category)
        db.session.flush()
    else:
        categories = list(Category.query.order_by(Category.name.asc()).all())

    if not User.query.filter_by(email="admin@vshein.local").first():
        admin = User(
            name="Administrador",
            email="admin@vshein.local",
            role="admin",
        )
        admin.set_password("Admin123!")
        db.session.add(admin)

    if not User.query.filter_by(email="empleado@vshein.local").first():
        empleado = User(
            name="Empleado",
            email="empleado@vshein.local",
            role="empleado",
        )
        empleado.set_password("Empleado123!")
        db.session.add(empleado)

    if not Product.query.first():
        hero_category = next(
            (item for item in categories if item.name == "Vestidos"),
            categories[0],
        )
        product = Product(
            name="Vestido de impacto",
            slug=unique_slug(Product, "Vestido de impacto"),
            description=(
                "Prenda pensada para resaltar estilo, movimiento y presencia en cada "
                "foto y en cada salida."
            ),
            stock=12,
            sold_count=38,
            low_stock_threshold=4,
            featured=True,
            category=hero_category,
        )
        db.session.add(product)
        db.session.flush()
        db.session.add(
            ProductMedia(
                product=product,
                media_type="image",
                file_path="/static/img/hero-bg.png",
                caption="Imagen principal de la marca",
                sort_order=1,
            )
        )

    db.session.commit()
