from flask import Blueprint, render_template, request, jsonify
from sqlalchemy import case
from app.models import Product, AnalyticsEvent
from app import db

public_bp = Blueprint('public', __name__)

@public_bp.route('/')
def index():
    # Orden editorial: primero la promesa principal de marca, luego lo complementario.
    category_rank = case(
        (Product.category == 'mujer', 0),
        (Product.category == 'accesorios', 1),
        (Product.category == 'ninos', 2),
        else_=3
    )
    products = Product.query.order_by(
        category_rank,
        Product.created_at.desc()
    ).all()
    featured_products = products[:4]
    category_counts = {
        'mujer': Product.query.filter_by(category='mujer').count(),
        'accesorios': Product.query.filter_by(category='accesorios').count(),
        'ninos': Product.query.filter_by(category='ninos').count(),
    }
    return render_template(
        'public/index.html',
        products=products,
        featured_products=featured_products,
        category_counts=category_counts
    )

@public_bp.route('/api/analytics', methods=['POST'])
def save_analytics():
    """Endpoint silencioso para guardar eventos de analíticas"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    try:
        event = AnalyticsEvent(
            event_type=data.get('event_type'),
            element_id=data.get('element_id'),
            duration_seconds=data.get('duration'),
            session_id=data.get('session_id')
        )
        db.session.add(event)
        db.session.commit()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
