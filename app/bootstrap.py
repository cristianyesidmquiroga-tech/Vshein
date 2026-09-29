from __future__ import annotations

from .extensions import db
from .models import Category, Product, ProductMedia, User


DEFAULT_CATEGORIES = [
    "Accesorios",
    "Blusas",
    "Faldas",
    "Medias",
    "Pantalones",
    "Ropa interior",
    "Tops",
    "Vestidos",

]

DEMO_PRODUCTS = [
    {
        "name": "Vestido Elegante Blanco",
        "category": "Vestidos",
        "description": "Vestido de corte fluido, ideal para ocasiones especiales o una salida de noche.",
        "stock": 8,
        "sold_count": 34,
        "featured": True,
        "image": "vestidos.jpg",
    },
    {
        "name": "Blusa Clásica Blanca",
        "category": "Blusas",
        "description": "Blusa versátil de cuello camisero, perfecta para combinar con cualquier look.",
        "stock": 15,
        "sold_count": 22,
        "featured": False,
        "image": "blusas.jpg",
    },
    {
        "name": "Falda Larga Vino Tinto",
        "category": "Faldas",
        "description": "Falda larga de caída elegante, con movimiento y un color intenso que enamora.",
        "stock": 6,
        "sold_count": 19,
        "featured": True,
        "image": "faldas.jpg",
    },
    {
        "name": "Pantalón Palazzo Negro",
        "category": "Pantalones",
        "description": "Pantalón de pierna ancha y tiro alto, cómodo y elegante para el día a día.",
        "stock": 10,
        "sold_count": 27,
        "featured": False,
        "image": "pantalones.jpg",
    },
    {
        "name": "Conjunto Casual Denim",
        "category": "Tops",
        "description": "Top básico combinado con chaqueta denim, ideal para un look casual y fresco.",
        "stock": 12,
        "sold_count": 31,
        "featured": True,
        "image": "tops.jpg",
    },
    {
        "name": "Set de Accesorios Boho",
        "category": "Accesorios",
        "description": "Pañoleta, gafas y aretes en un set pensado para darle el toque final a tu look.",
        "stock": 9,
        "sold_count": 16,
        "featured": False,
        "image": "accesorios.jpg",
    },
    {
        "name": "Medias Veladas Clásicas",
        "category": "Medias",
        "description": "Medias veladas de uso diario, suaves y resistentes, disponibles en varios tonos.",
        "stock": 20,
        "sold_count": 12,
        "featured": False,
        "image": None,
    },
    {
        "name": "Conjunto Básico Algodón",
        "category": "Ropa interior",
        "description": "Conjunto básico de algodón, cómodo para uso diario, disponible en varias tallas.",
        "stock": 18,
        "sold_count": 9,
        "featured": False,
        "image": None,
    },
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

    if not User.query.filter_by(email="admin@misslindas.local").first():
        admin = User(
            name="Administrador",
            email="admin@misslindas.local",
            role="admin",
        )
        admin.set_password("Admin123!")
        db.session.add(admin)

    if not User.query.filter_by(email="empleado@misslindas.local").first():
        empleado = User(
            name="Empleado",
            email="empleado@misslindas.local",
            role="empleado",
        )
        empleado.set_password("Empleado123!")
        db.session.add(empleado)

    if not Product.query.first():
        categories_by_name = {item.name: item for item in categories}
        for entry in DEMO_PRODUCTS:
            category = categories_by_name.get(entry["category"])
            if not category:
                continue
            product = Product(
                name=entry["name"],
                slug=unique_slug(Product, entry["name"]),
                description=entry["description"],
                stock=entry["stock"],
                sold_count=entry["sold_count"],
                featured=entry["featured"],
                category=category,
            )
            db.session.add(product)
            db.session.flush()
            if entry["image"]:
                db.session.add(
                    ProductMedia(
                        product=product,
                        media_type="image",
                        file_path=f"img/catalogo/{entry['image']}",
                        caption=entry["name"],
                        sort_order=1,
                    )
                )

    db.session.commit()
