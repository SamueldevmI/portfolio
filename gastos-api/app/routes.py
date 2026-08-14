from datetime import date, datetime

from flask import Blueprint, jsonify, request

from .database import db
from .models import Gasto

bp = Blueprint("gastos", __name__, url_prefix="/gastos")


def _parse_data(valor: str | None) -> date:
    if not valor:
        return date.today()
    try:
        return datetime.strptime(valor, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError("O campo 'data' deve estar no formato AAAA-MM-DD.")


def _validar_payload(dados: dict, exigir_todos: bool = True) -> dict:
    erros = []
    resultado = {}

    if "descricao" in dados or exigir_todos:
        descricao = str(dados.get("descricao", "")).strip()
        if not descricao:
            erros.append("O campo 'descricao' é obrigatório.")
        resultado["descricao"] = descricao

    if "valor" in dados or exigir_todos:
        try:
            valor = float(dados.get("valor"))
            if valor <= 0:
                erros.append("O campo 'valor' deve ser maior que zero.")
            resultado["valor"] = valor
        except (TypeError, ValueError):
            erros.append("O campo 'valor' deve ser um número.")

    if "categoria" in dados or exigir_todos:
        categoria = str(dados.get("categoria", "")).strip()
        if not categoria:
            erros.append("O campo 'categoria' é obrigatório.")
        resultado["categoria"] = categoria

    if "data" in dados or exigir_todos:
        try:
            resultado["data"] = _parse_data(dados.get("data"))
        except ValueError as erro:
            erros.append(str(erro))

    if "tipo" in dados:
        tipo = str(dados.get("tipo") or "despesa").strip().lower()
        if tipo not in ("receita", "despesa"):
            erros.append("O campo 'tipo' deve ser 'receita' ou 'despesa'.")
        resultado["tipo"] = tipo
    elif exigir_todos:
        resultado["tipo"] = "despesa"

    if erros:
        raise ValueError(" ".join(erros))
    return resultado


@bp.get("")
def listar_gastos():
    categoria = request.args.get("categoria")
    query = Gasto.query
    if categoria:
        query = query.filter(Gasto.categoria.ilike(categoria))
    gastos = query.order_by(Gasto.data.desc()).all()
    return jsonify([g.to_dict() for g in gastos])


@bp.post("")
def criar_gasto():
    dados = request.get_json(silent=True) or {}
    try:
        limpo = _validar_payload(dados)
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    gasto = Gasto(**limpo)
    db.session.add(gasto)
    db.session.commit()
    return jsonify(gasto.to_dict()), 201


@bp.get("/<int:gasto_id>")
def obter_gasto(gasto_id: int):
    gasto = db.session.get(Gasto, gasto_id)
    if gasto is None:
        return jsonify({"erro": "Gasto não encontrado."}), 404
    return jsonify(gasto.to_dict())


@bp.put("/<int:gasto_id>")
def atualizar_gasto(gasto_id: int):
    gasto = db.session.get(Gasto, gasto_id)
    if gasto is None:
        return jsonify({"erro": "Gasto não encontrado."}), 404

    dados = request.get_json(silent=True) or {}
    try:
        limpo = _validar_payload(dados, exigir_todos=False)
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    for campo, valor in limpo.items():
        setattr(gasto, campo, valor)
    db.session.commit()
    return jsonify(gasto.to_dict())


@bp.delete("/<int:gasto_id>")
def remover_gasto(gasto_id: int):
    gasto = db.session.get(Gasto, gasto_id)
    if gasto is None:
        return jsonify({"erro": "Gasto não encontrado."}), 404

    db.session.delete(gasto)
    db.session.commit()
    return "", 204


@bp.get("/resumo")
def resumo_gastos():
    gastos = Gasto.query.all()
    total = sum(g.valor for g in gastos)
    por_categoria: dict[str, float] = {}
    for g in gastos:
        por_categoria[g.categoria] = por_categoria.get(g.categoria, 0) + g.valor

    return jsonify({
        "total": round(total, 2),
        "quantidade": len(gastos),
        "por_categoria": {c: round(v, 2) for c, v in por_categoria.items()},
    })
