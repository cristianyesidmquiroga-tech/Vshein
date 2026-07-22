from flask import Flask

from .bootstrap import seed_demo_data
from .extensions import db, login_manager
from .routes.admin import admin_bp
from .routes.auth import auth_bp
from .routes.main import main_bp


def create_app(config_object: str | None = None) -> Flask:
    app = Flask(
        __name__,
        instance_relative_config=True,
        template_folder="templates",
        static_folder="static",
    )

    app.config.from_mapping(
        SECRET_KEY="change-this-in-instance-config",
        SQLALCHEMY_DATABASE_URI=f"sqlite:///{app.instance_path}/dev.sqlite3",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        CREATE_ALL_ON_STARTUP=True,
    )

    if config_object:
        app.config.from_object(config_object)
    else:
        try:
            app.config.from_pyfile("config.py", silent=True)
        except (FileNotFoundError, OSError):
            pass

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    login_manager.login_message = "Debes iniciar sesion para entrar al panel."

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)

    with app.app_context():
        if app.config.get("CREATE_ALL_ON_STARTUP", True):
            db.create_all()
            seed_demo_data()

    return app
