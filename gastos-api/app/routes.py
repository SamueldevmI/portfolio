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
    """Lista todos os gastos, com filtro opcional por categoria.
    ---
    tags:
      - Gastos
    parameters:
      - name: categoria
        in: query
        type: string
        required: false
        description: Filtra pela categoria informada (case-insensitive).
    responses:
      200:
        description: Lista de gastos, ordenada por data (mais recente primeiro).
        schema:
          type: array
          items:
            $ref: '#/definitions/Gasto'
    """
    categoria = request.args.get("categoria")
    query = Gasto.query
    if categoria:
        query = query.filter(Gasto.categoria.ilike(categoria))
    gastos = query.order_by(Gasto.data.desc()).all()
    return jsonify([g.to_dict() for g in gastos])


@bp.post("")
def criar_gasto():
    """Cria um novo gasto ou receita.
    ---
    tags:
      - Gastos
    parameters:
      - name: body
        in: body
        required: true
        schema:
          $ref: '#/definitions/NovoGasto'
    responses:
      201:
        description: Gasto criado com sucesso.
        schema:
          $ref: '#/definitions/Gasto'
      400:
        description: Payload inválido (campo faltando, valor negativo, tipo inválido etc).
        schema:
          $ref: '#/definitions/Erro'
    """
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
    """Busca um gasto pelo id.
    ---
    tags:
      - Gastos
    parameters:
      - name: gasto_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Gasto encontrado.
        schema:
          $ref: '#/definitions/Gasto'
      404:
        description: Nenhum gasto com esse id.
        schema:
          $ref: '#/definitions/Erro'
    """
    gasto = db.session.get(Gasto, gasto_id)
    if gasto is None:
        return jsonify({"erro": "Gasto não encontrado."}), 404
    return jsonify(gasto.to_dict())


@bp.put("/<int:gasto_id>")
def atualizar_gasto(gasto_id: int):
    """Atualiza um ou mais campos de um gasto existente.
    ---
    tags:
      - Gastos
    parameters:
      - name: gasto_id
        in: path
        type: integer
        required: true
      - name: body
        in: body
        required: true
        description: Envie só os campos que quer alterar.
        schema:
          $ref: '#/definitions/NovoGasto'
    responses:
      200:
        description: Gasto atualizado.
        schema:
          $ref: '#/definitions/Gasto'
      400:
        description: Payload inválido.
        schema:
          $ref: '#/definitions/Erro'
      404:
        description: Nenhum gasto com esse id.
        schema:
          $ref: '#/definitions/Erro'
    """
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
    """Remove um gasto.
    ---
    tags:
      - Gastos
    parameters:
      - name: gasto_id
        in: path
        type: integer
        required: true
    responses:
      204:
        description: Removido com sucesso (sem corpo na resposta).
      404:
        description: Nenhum gasto com esse id.
        schema:
          $ref: '#/definitions/Erro'
    """
    gasto = db.session.get(Gasto, gasto_id)
    if gasto is None:
        return jsonify({"erro": "Gasto não encontrado."}), 404

    db.session.delete(gasto)
    db.session.commit()
    return "", 204


@bp.get("/resumo")
def resumo_gastos():
    """Retorna total geral, quantidade e soma por categoria.
    ---
    tags:
      - Gastos
    responses:
      200:
        description: Resumo agregado de todos os gastos.
        schema:
          type: object
          properties:
            total:
              type: number
              example: 180.0
            quantidade:
              type: integer
              example: 3
            por_categoria:
              type: object
              additionalProperties:
                type: number
              example: {"casa": 150.0, "lazer": 30.0}
    """
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
