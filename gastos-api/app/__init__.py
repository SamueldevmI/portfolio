from flask import Flask
from flask_cors import CORS

from .database import db

ORIGENS_PERMITIDAS = [
    "https://samueldevmi.github.io",
    "http://localhost:8765",
]


def create_app(database_uri: str = "sqlite:///gastos.db") -> Flask:
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(app, origins=ORIGENS_PERMITIDAS)
    db.init_app(app)

    from . import models  # noqa: F401  (garante que os modelos sejam registrados)
    from .routes import bp as gastos_bp

    app.register_blueprint(gastos_bp)

    with app.app_context():
        db.create_all()

    @app.get("/")
    def raiz():
        return {"status": "ok", "servico": "Controle de Gastos API"}

    return app
