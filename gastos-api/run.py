import os

from app import create_app

app = create_app()

if __name__ == "__main__":
    # O modo debug abre um console Python no navegador quando dá erro: só liga de propósito (FLASK_DEBUG=1),
    # nunca por padrão. Em produção a API roda com gunicorn, que não usa esse bloco.
    app.run(debug=os.environ.get("FLASK_DEBUG") == "1")
