from __future__ import annotations

import time

from flask import Blueprint, current_app, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_user, logout_user
from werkzeug.security import check_password_hash, generate_password_hash

from ..extensions import limiter
from ..models import User


auth_bp = Blueprint("auth", __name__)

# Hash de relleno: se compara contra este cuando el email no existe, para que
# el tiempo de respuesta no delate si una cuenta es real o no.
_DUMMY_HASH = generate_password_hash("no-such-account-dummy-password")

# Bloqueo progresivo por IP en memoria del proceso. En despliegue con varios
# workers/procesos esto debe moverse a un almacen compartido (Redis).
_FAILED_ATTEMPTS: dict[str, list[float]] = {}
_LOCKOUT_STEPS = [(3, 30), (5, 120), (8, 900)]


def _client_ip() -> str:
    return request.remote_addr or "unknown"


def _seconds_locked(ip: str) -> int:
    now = time.time()
    attempts = [t for t in _FAILED_ATTEMPTS.get(ip, []) if now - t < 900]
    _FAILED_ATTEMPTS[ip] = attempts
    count = len(attempts)
    wait = 0
    for threshold, seconds in _LOCKOUT_STEPS:
        if count >= threshold:
            wait = seconds
    if not attempts:
        return 0
    elapsed = now - attempts[-1]
    remaining = wait - elapsed
    return max(0, int(remaining))


def _record_failure(ip: str) -> None:
    _FAILED_ATTEMPTS.setdefault(ip, []).append(time.time())


def _clear_failures(ip: str) -> None:
    _FAILED_ATTEMPTS.pop(ip, None)


@auth_bp.route("/ingresar", methods=["GET", "POST"])
@limiter.limit("10 per minute")
def login():
    if current_user.is_authenticated:
        return redirect(url_for("admin.dashboard"))

    if request.method == "POST":
        ip = _client_ip()
        locked_for = _seconds_locked(ip)
        if locked_for > 0:
            current_app.logger.warning("login bloqueado por intentos fallidos ip=%s", ip)
            flash(f"Demasiados intentos. Espera {locked_for} segundos e intenta de nuevo.", "error")
            return render_template("admin/login.html"), 429

        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        user = User.query.filter_by(email=email).first()

        password_ok = check_password_hash(user.password_hash if user else _DUMMY_HASH, password)

        if not user or not password_ok or not user.is_active_user:
            _record_failure(ip)
            current_app.logger.warning("login fallido ip=%s email=%s", ip, email)
            flash("Credenciales invalidas.", "error")
            return render_template("admin/login.html"), 401

        _clear_failures(ip)
        login_user(user)
        return redirect(url_for("admin.dashboard"))

    return render_template("admin/login.html")


@auth_bp.route("/salir")
def logout():
    logout_user()
    return redirect(url_for("main.index"))
