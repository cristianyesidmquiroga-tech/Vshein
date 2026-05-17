from app import create_app, db
from app.models import User
import sys

app = create_app()

def init_db():
    with app.app_context():
        # Crear todas las tablas
        db.create_all()
        print("Tablas creadas exitosamente.")
        
        # Verificar si existe el administrador
        admin = User.query.filter_by(username='vshein_admin').first()
        if not admin:
            print("Creando usuario administrador por defecto...")
            admin = User(username='vshein_admin')
            # Contraseña por defecto: cambiar luego
            admin.set_password('VsheinAdmin2026!')
            db.session.add(admin)
            db.session.commit()
            print("Usuario 'vshein_admin' creado con contraseña 'VsheinAdmin2026!'")
        else:
            print("El usuario administrador ya existe.")

if __name__ == '__main__':
    print("Iniciando configuración de Base de Datos...")
    init_db()
    print("Finalizado.")
