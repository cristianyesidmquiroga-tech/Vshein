import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from werkzeug.utils import secure_filename

db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    
    # Configuraciones básicas
    app.config['SECRET_KEY'] = 'vshein_super_secret_key_2026'
    
    # Base de datos: SQLite para desarrollo, preparable para PostgreSQL
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'vshein.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Configuración de subidas (Uploads)
    app.config['UPLOAD_FOLDER'] = os.path.join(basedir, 'static', 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # Máximo 50MB para videos
    
    # Inicializar extensiones
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'admin.login'
    
    with app.app_context():
        # Importar modelos para que SQLAlchemy los registre
        from . import models
        db.create_all()
        
        @login_manager.user_loader
        def load_user(user_id):
            return models.User.query.get(int(user_id))
        
        # Registrar Blueprints
        from .routes.public import public_bp
        from .routes.admin import admin_bp
        app.register_blueprint(public_bp)
        app.register_blueprint(admin_bp)
        
    return app
