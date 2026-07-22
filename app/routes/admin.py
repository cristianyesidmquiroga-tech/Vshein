from __future__ import annotations

from flask import Blueprint, abort, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required

from ..bootstrap import unique_slug
from ..extensions import db
from ..models import Category, InventoryMovement, Product


admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


def admin_or_empleado_required() -> None:
    if not current_user.is_authenticated:
        abort(401)
    if current_user.role not in {"admin", "empleado"}:
        abort(403)


@admin_bp.route("/")
@login_required
def dashboard():
    admin_or_empleado_required()
    category_filter = request.args.get("category", "").strip()
    search = request.args.get("search", "").strip()

    products_query = Product.query.join(Category).filter(Product.is_active.is_(True))
    if category_filter:
        products_query = products_query.filter(Category.slug == category_filter)
    if search:
        products_query = products_query.filter(Product.name.ilike(f"%{search}%"))

    products = (
        products_query.order_by(Category.name.asc(), Product.name.asc()).all()
    )
    categories = Category.query.order_by(Category.name.asc()).all()

    total_stock = sum(product.stock for product in products)
    most_sold = sorted(products, key=lambda item: item.sold_count, reverse=True)[:5]
    low_stock = [product for product in products if product.stock <= product.low_stock_threshold]

    return render_template(
        "admin/dashboard.html",
        products=products,
        categories=categories,
        total_stock=total_stock,
        most_sold=most_sold,
        low_stock=low_stock,
        selected_category=category_filter,
        search=search,
    )


@admin_bp.route("/products/new", methods=["GET", "POST"])
@login_required
def product_create():
    admin_or_empleado_required()
    categories = Category.query.order_by(Category.name.asc()).all()

    if request.method == "POST":
        name = request.form.get("name", "").strip()
        description = request.form.get("description", "").strip()
        category_id = request.form.get("category_id", type=int)
        stock = request.form.get("stock", type=int)
        sold_count = request.form.get("sold_count", type=int)
        featured = bool(request.form.get("featured"))
        is_active = bool(request.form.get("is_active", True))

        if not name or not description or not category_id:
            flash("Completa los campos obligatorios.", "error")
            return render_template("admin/product_form.html", categories=categories, product=None)

        product = Product(
            name=name,
            slug=unique_slug(Product, name),
            description=description,
            category_id=category_id,
            stock=stock or 0,
            sold_count=sold_count or 0,
            featured=featured,
            is_active=is_active,
        )
        db.session.add(product)
        db.session.commit()
        flash("Producto creado.", "success")
        return redirect(url_for("admin.dashboard"))

    return render_template("admin/product_form.html", categories=categories, product=None)


@admin_bp.route("/products/<int:product_id>/edit", methods=["GET", "POST"])
@login_required
def product_edit(product_id: int):
    admin_or_empleado_required()
    product = db.session.get(Product, product_id)
    if not product:
        abort(404)

    categories = Category.query.order_by(Category.name.asc()).all()

    if request.method == "POST":
        product.name = request.form.get("name", "").strip()
        product.slug = unique_slug(Product, product.name, exclude_id=product.id)
        product.description = request.form.get("description", "").strip()
        product.category_id = request.form.get("category_id", type=int)
        product.stock = request.form.get("stock", type=int) or 0
        product.sold_count = request.form.get("sold_count", type=int) or 0
        product.low_stock_threshold = request.form.get("low_stock_threshold", type=int) or 5
        product.featured = bool(request.form.get("featured"))
        product.is_active = bool(request.form.get("is_active", True))
        db.session.commit()
        flash("Producto actualizado.", "success")
        return redirect(url_for("admin.dashboard"))

    return render_template("admin/product_form.html", categories=categories, product=product)


@admin_bp.route("/products/<int:product_id>/delete", methods=["POST"])
@login_required
def product_delete(product_id: int):
    admin_or_empleado_required()
    product = db.session.get(Product, product_id)
    if not product:
        abort(404)
    db.session.delete(product)
    db.session.commit()
    flash("Producto eliminado.", "success")
    return redirect(url_for("admin.dashboard"))


@admin_bp.route("/products/<int:product_id>/movement", methods=["POST"])
@login_required
def product_movement(product_id: int):
    admin_or_empleado_required()
    product = db.session.get(Product, product_id)
    if not product:
        abort(404)

    movement_type = request.form.get("movement_type", "adjustment")
    quantity = request.form.get("quantity", type=int) or 0
    note = request.form.get("note", "").strip() or None

    if movement_type == "entry":
        product.stock += quantity
    elif movement_type == "exit":
        product.stock = max(product.stock - quantity, 0)

    db.session.add(
        InventoryMovement(
            product_id=product.id,
            user_id=current_user.id,
            movement_type=movement_type,
            quantity=quantity,
            note=note,
        )
    )
    db.session.commit()
    flash("Movimiento de inventario registrado.", "success")
    return redirect(url_for("admin.dashboard"))
