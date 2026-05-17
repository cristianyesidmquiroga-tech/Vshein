import os
from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash, current_app
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.utils import secure_filename
from app.models import User, Product, ProductMedia, AnalyticsEvent
from app import db

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

# Definir extensiones permitidas
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'mp4'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('admin.dashboard'))
        
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('admin.dashboard'))
        else:
            flash('Usuario o contraseña incorrectos', 'error')
            
    return render_template('admin/login.html')

@admin_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('admin.login'))

@admin_bp.route('/')
@login_required
def dashboard():
    # Obtener métricas básicas
    total_products = Product.query.count()
    
    # Métricas de Analytics
    wsp_clicks = AnalyticsEvent.query.filter(AnalyticsEvent.event_type == 'click').filter(AnalyticsEvent.element_id.like('whatsapp%')).count()
    ig_clicks = AnalyticsEvent.query.filter(AnalyticsEvent.event_type == 'click').filter(AnalyticsEvent.element_id.like('instagram%')).count()
    
    return render_template('admin/dashboard.html', 
                           total_products=total_products,
                           wsp_clicks=wsp_clicks,
                           ig_clicks=ig_clicks)

@admin_bp.route('/inventory', methods=['GET', 'POST'])
@login_required
def inventory():
    if request.method == 'POST':
        # Procesar la subida de un nuevo producto
        name = request.form.get('name')
        category = request.form.get('category')
        subcategory = request.form.get('subcategory')
        sizes = request.form.get('sizes')
        description = request.form.get('description')
        
        if name and category:
            new_product = Product(
                name=name,
                category=category,
                subcategory=subcategory,
                sizes=sizes,
                description=description
            )
            db.session.add(new_product)
            db.session.commit()
            
            # Procesar imágenes/videos
            files = request.files.getlist('media_files')
            for index, file in enumerate(files):
                if file and allowed_file(file.filename):
                    filename = secure_filename(f"{new_product.id}_{file.filename}")
                    
                    media_type = 'video' if filename.endswith('.mp4') else 'image'
                    subfolder = 'videos' if media_type == 'video' else 'images'
                    
                    upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], subfolder)
                    os.makedirs(upload_path, exist_ok=True)
                    
                    file.save(os.path.join(upload_path, filename))
                    
                    media_entry = ProductMedia(
                        product_id=new_product.id,
                        file_path=f"uploads/{subfolder}/{filename}",
                        media_type=media_type,
                        order=index
                    )
                    db.session.add(media_entry)
            
            db.session.commit()
            flash('Producto añadido con éxito', 'success')
            return redirect(url_for('admin.inventory'))
            
    products = Product.query.order_by(Product.created_at.desc()).all()
    return render_template('admin/inventory.html', products=products)
