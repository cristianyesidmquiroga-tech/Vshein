from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SQLITE_RELATIVE_PREFIX = "sqlite:///"


class ConfigError(RuntimeError):
    pass


def _require(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise ConfigError(
            f"Falta la variable de entorno {name}. Crea un archivo .env local "
            "(no se versiona) con las variables listadas en README.md."
        )
    return value


def _resolve_database_url(raw_url: str) -> str:
    is_relative_sqlite = raw_url.startswith(SQLITE_RELATIVE_PREFIX) and not raw_url.startswith(
        f"{SQLITE_RELATIVE_PREFIX}/"
    )
    if not is_relative_sqlite:
        return raw_url
    relative_path = raw_url[len(SQLITE_RELATIVE_PREFIX):]
    absolute_path = os.path.join(BASE_DIR, *relative_path.split("/"))
    return SQLITE_RELATIVE_PREFIX + absolute_path.replace(os.sep, "/")


def get_config() -> dict:
    is_production = os.getenv("FLASK_ENV", "production") == "production"

    return {
        "SECRET_KEY": _require("SECRET_KEY"),
        "SQLALCHEMY_DATABASE_URI": _resolve_database_url(_require("DATABASE_URL")),
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
        "ADMIN_PATH_PREFIX": os.getenv("ADMIN_PATH_PREFIX", "equipo-sv").strip("/"),
        "SEED_DEMO_DATA": os.getenv("SEED_DEMO_DATA", "false").lower() == "true",
        "SESSION_COOKIE_SECURE": is_production,
        "SESSION_COOKIE_HTTPONLY": True,
        "SESSION_COOKIE_SAMESITE": "Strict",
        "PERMANENT_SESSION_LIFETIME": 60 * 60 * 8,
        "MAX_CONTENT_LENGTH": 5 * 1024 * 1024,
    }
