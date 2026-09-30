import os

from flask import Flask
from flasgger import Swagger
from flask_cors import CORS
from sqlalchemy import inspect, text
from werkzeug.middleware.proxy_fix import ProxyFix

from .database import db
from .limites import limiter

ORIGENS_PERMITIDAS = [
    "https://samueldevmi.github.io",
    "http://localhost:8765",
    "http://localhost:8142",
    "http://localhost:8143",
]

SWAGGER_TEMPLATE = {
    "swagger": "2.0",
    "info": {
        "title": "Controle de Gastos API",
        "description": "API REST em Flask + SQLAlchemy para registrar receitas e despesas. "
                        "Projeto de portfólio de Samuel Mickael.",
        "version": "1.0.0",
        "contact": {
            "name": "Samuel Mickael",
            "url": "https://samueldevmi.github.io/portfolio/",
        },
    },
    "definitions": {
        "Gasto": {
            "type": "object",
            "properties": {
                "id": {"type": "integer", "example": 1},
                "descricao": {"type": "string", "example": "Mercado"},
                "valor": {"type": "number", "format": "float", "example": 150.5},
                "categoria": {"type": "string", "example": "alimentação"},
                "data": {"type": "string", "format": "date", "example": "2026-08-01"},
                "tipo": {"type": "string", "enum": ["receita", "despesa"], "example": "despesa"},
            },
        },
        "NovoGasto": {
            "type": "object",
            "required": ["descricao", "valor", "categoria"],
            "properties": {
                "descricao": {"type": "string", "example": "Mercado"},
                "valor": {"type": "number", "format": "float", "example": 150.5},
                "categoria": {"type": "string", "example": "alimentação"},
                "data": {"type": "string", "format": "date", "example": "2026-08-01"},
                "tipo": {"type": "string", "enum": ["receita", "despesa"], "default": "despesa"},
            },
        },
        "Erro": {
            "type": "object",
            "properties": {"erro": {"type": "string", "example": "O campo 'descricao' é obrigatório."}},
        },
        "GastoCasal": {
            "type": "object",
            "properties": {
                "id": {"type": "integer", "example": 1},
                "descricao": {"type": "string", "example": "Mercado"},
                "valor": {"type": "number", "format": "float", "example": 150.5},
                "categoria": {"type": "string", "example": "alimentação"},
                "data": {"type": "string", "format": "date", "example": "2026-08-01"},
                "integrante_id": {"type": "integer", "example": 1},
                "integrante_nome": {"type": "string", "example": "Ana"},
            },
        },
    },
}

SWAGGER_CONFIG = {
    "headers": [],
    "specs": [{"endpoint": "apispec", "route": "/apispec.json", "rule_filter": lambda rule: True, "model_filter": lambda tag: True}],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/docs",
}


def _migrar_coluna_tipo() -> None:
    """Adiciona a coluna 'tipo' em bancos que existiam antes dela ser criada.

    Não há Alembic configurado neste projeto pequeno, e `db.create_all()`
    só cria tabelas novas — não altera tabelas já existentes. Sem isso, o
    banco do Render (que já tem gastos sem 'tipo') quebraria em produção.
    """
    inspetor = inspect(db.engine)
    if "gastos" not in inspetor.get_table_names():
        return
    colunas = {coluna["name"] for coluna in inspetor.get_columns("gastos")}
    if "tipo" not in colunas:
        with db.engine.connect() as conexao:
            conexao.execute(text("ALTER TABLE gastos ADD COLUMN tipo VARCHAR(10) NOT NULL DEFAULT 'despesa'"))
            conexao.commit()


def create_app(database_uri: str = "sqlite:///gastos.db") -> Flask:
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    # um gasto tem poucos campos curtos; sem limite, um pedido de centenas de MB ocuparia a memória do servidor
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024

    # O Render fica na frente da API: sem isso, todo mundo teria o IP do Render e dividiria o mesmo limite.
    # Confia só no último endereço que o proxy acrescentou (o resto do cabeçalho o visitante pode inventar).
    proxies = int(os.environ.get("PROXIES_NA_FRENTE", "1"))
    if proxies:
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=proxies)

    # max_age: o navegador guarda a permissão por 10 min em vez de pedir de novo a cada chamada
    CORS(app, origins=ORIGENS_PERMITIDAS, max_age=600)
    db.init_app(app)
    limiter.init_app(app)
    Swagger(app, template=SWAGGER_TEMPLATE, config=SWAGGER_CONFIG)

    from . import models, models_casal  # noqa: F401  (garante que os modelos sejam registrados)
    from .routes import bp as gastos_bp
    from .routes_casal import bp as casal_bp

    app.register_blueprint(gastos_bp)
    app.register_blueprint(casal_bp)

    with app.app_context():
        db.create_all()
        _migrar_coluna_tipo()

    @app.errorhandler(429)
    def pedidos_demais(_erro):
        return {"erro": "Muitos pedidos seguidos. Espera um pouquinho e tenta de novo."}, 429

    @app.errorhandler(413)
    def corpo_grande_demais(_erro):
        return {"erro": "Pedido grande demais."}, 413

    @app.after_request
    def cabecalhos_de_seguranca(resposta):
        # o navegador não tenta "adivinhar" que um JSON é HTML ou script
        resposta.headers.setdefault("X-Content-Type-Options", "nosniff")
        return resposta

    @app.get("/")
    def raiz():
        return {"status": "ok", "servico": "Controle de Gastos API", "docs": "/docs"}

    return app
