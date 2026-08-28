"""Fixtures compartidas: app Flask contra una base en memoria, sin tocar la real."""

import os

import pytest

os.environ.setdefault("SECRET_KEY", "clave-solo-para-pruebas")
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("FLASK_ENV", "development")

from app import create_app
from app.extensions import db as _db


@pytest.fixture
def app():
    application = create_app()
    application.config.update(TESTING=True, WTF_CSRF_ENABLED=False)
    with application.app_context():
        _db.create_all()
        yield application
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def db(app):
    return _db
