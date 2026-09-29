from datetime import date

from flask import Flask

from config import get_config

from .bootstrap import seed_demo_data
from .extensions import csrf, db, limiter, login_manager, migrate
from .routes.admin import admin_bp
from .routes.auth import auth_bp
from .routes.main import main_bp

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Content-Security-Policy": (
        "default-src 'self'; script-src 'self'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src https://fonts.gstatic.com; img-src 'self' data:; "
        "connect-src 'self'; base-uri 'none'; form-action 'self'"
    ),
}


def create_app() -> Flask:
    app = Flask(__name__, template_folder="templates", static_folder="static")
    app.config.update(get_config())

    db.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)
    limiter.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    login_manager.login_message = "Debes iniciar sesion para entrar al panel."

    if app.config["SESSION_COOKIE_SECURE"]:
        SECURITY_HEADERS["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    @app.context_processor
    def inject_current_year():
        return {"current_year": date.today().year}

    @app.after_request
    def set_security_headers(response):
        for header, value in SECURITY_HEADERS.items():
            response.headers.setdefault(header, value)
        return response

    admin_prefix = f"/{app.config['ADMIN_PATH_PREFIX']}"
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix=admin_prefix)
    app.register_blueprint(admin_bp, url_prefix=admin_prefix)

    @app.cli.command("seed-demo-data")
    def seed_demo_data_command() -> None:
        """Crea categorias y usuarios demo (solo si SEED_DEMO_DATA=true en .env)."""
        if not app.config["SEED_DEMO_DATA"]:
            print("SEED_DEMO_DATA no esta activado en .env; nada que hacer.")
            return
        seed_demo_data()
        print("Datos demo verificados/creados.")

    return app
