"""Regras de entrada compartilhadas pelas rotas de gastos e do casal.

A API é pública (sem login): qualquer pessoa pode mandar qualquer coisa. O SQLite não
respeita o tamanho das colunas (String(140) aceita 1 MB), então o limite é conferido aqui.
"""
import math

MAX_DESCRICAO = 140   # mesmo tamanho das colunas nos modelos
MAX_CATEGORIA = 60
MAX_VALOR = 1_000_000_000


def texto(dados: dict, campo: str, maximo: int, erros: list[str]) -> str:
    valor = str(dados.get(campo, "")).strip()
    if not valor:
        erros.append(f"O campo '{campo}' é obrigatório.")
    elif len(valor) > maximo:
        erros.append(f"O campo '{campo}' pode ter no máximo {maximo} caracteres.")
    return valor


def valor_positivo(dados: dict, erros: list[str]) -> float | None:
    """Número finito, maior que zero e de tamanho razoável.

    NaN e Infinity passam por float() (e o json do Python aceita NaN sem aspas), mas
    quebram a soma dos totais e o JSON de resposta que o site lê.
    """
    try:
        valor = float(dados.get("valor"))
    except (TypeError, ValueError):
        erros.append("O campo 'valor' deve ser um número.")
        return None
    if not math.isfinite(valor):
        erros.append("O campo 'valor' deve ser um número.")
    elif valor <= 0:
        erros.append("O campo 'valor' deve ser maior que zero.")
    elif valor > MAX_VALOR:
        erros.append("O campo 'valor' é grande demais.")
    return valor
