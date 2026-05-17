from . import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    def __init__(self, username=None, **kwargs):
        super(User, self).__init__(**kwargs)
        if username:
            self.username = username

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), nullable=False) # 'mujer', 'ninos', 'accesorios'
    subcategory = db.Column(db.String(50), nullable=True) # 'pantalon', 'ropa interior', 'faldas', 'vestidos', etc.
    sizes = db.Column(db.String(100), nullable=True) # E.g., 'S,M,L' o 'Única'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación con fotos
    media = db.relationship('ProductMedia', backref='product', lazy=True, cascade='all, delete-orphan')

class ProductMedia(db.Model):
    __tablename__ = 'product_media'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    media_type = db.Column(db.String(20), nullable=False) # 'image' o 'video'
    color_variant = db.Column(db.String(50), nullable=True) # E.g., 'Rojo', 'Azul'
    order = db.Column(db.Integer, default=0) # Para ordenar qué foto va primero

class AnalyticsEvent(db.Model):
    __tablename__ = 'analytics_events'
    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.String(50), nullable=False) # 'page_view', 'click_wsp', 'click_ig', 'dwell_time'
    element_id = db.Column(db.String(100), nullable=True) # ID del producto o sección
    duration_seconds = db.Column(db.Integer, nullable=True) # Para dwell_time
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    session_id = db.Column(db.String(100), nullable=True) # Para rastrear un usuario anónimo
