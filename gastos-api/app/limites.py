"""Limite de pedidos por endereço de IP. A API é pública e sem login: sem isso, qualquer um
apaga tudo, enche o banco ou fica chutando código de casal até acertar.

Guardado na memória do servidor: some quando ele reinicia e, com vários processos do gunicorn,
cada um conta separado. Pra uma demo de portfólio é o suficiente; pra algo sério, Redis.
"""
from flask import request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# ler: folgado (o Conta a Dois consulta 3x a cada 4 s por aba, ~90/min com o par aberto)
LEITURA = "300 per minute;20000 per day"
# criar, editar e apagar
ESCRITA = "30 per minute;500 per day"
CRIAR_CASAL = "10 per hour"
# código de casal que não existe: quem erra muito está chutando (são ~887 milhões de códigos)
CODIGO_ERRADO = "30 per minute;200 per day"

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[LEITURA],
    # o OPTIONS é o navegador pedindo permissão antes de cada chamada com JSON: não conta
    default_limits_exempt_when=lambda: request.method == "OPTIONS",
    storage_uri="memory://",
)

escrita = limiter.shared_limit(ESCRITA, scope="escrita")
codigo_errado = limiter.shared_limit(
    CODIGO_ERRADO, scope="codigo-errado", override_defaults=False,
    deduct_when=lambda resposta: resposta.status_code == 404,
)
