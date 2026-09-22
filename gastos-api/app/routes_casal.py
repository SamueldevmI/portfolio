import random
import string
from datetime import date, datetime, timedelta

from flask import Blueprint, jsonify, request

from .database import db
from .models_casal import MAX_INTEGRANTES_POR_CASAL, Casal, GastoCasal, Integrante

bp = Blueprint("casal", __name__, url_prefix="/casal")

_ALFABETO_CODIGO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"  # sem 0/O/1/I/L, pra não confundir na hora de digitar
_DIAS_ATE_LIMPAR = 30
_MAX_CASAIS = 500


def _gerar_codigo() -> str:
    for _ in range(20):
        codigo = "".join(random.choice(_ALFABETO_CODIGO) for _ in range(6))
        if not Casal.query.filter_by(codigo=codigo).first():
            return codigo
    raise RuntimeError("Não foi possível gerar um código único.")


def _limpar_casais_antigos() -> None:
    """Remove casais de demonstração antigos pra não acumular lixo no banco gratuito."""
    limite = datetime.utcnow() - timedelta(days=_DIAS_ATE_LIMPAR)
    antigos = Casal.query.filter(Casal.criado_em < limite).all()
    for casal in antigos:
        db.session.delete(casal)
    if antigos:
        db.session.commit()


def _buscar_casal_ou_none(codigo: str) -> Casal | None:
    return Casal.query.filter_by(codigo=(codigo or "").strip().upper()).first()


def _validar_nome(dados: dict) -> str:
    nome = str(dados.get("nome", "")).strip()
    if not nome:
        raise ValueError("O campo 'nome' é obrigatório.")
    if len(nome) > 40:
        raise ValueError("O nome pode ter no máximo 40 caracteres.")
    return nome


def _parse_data(valor: str | None) -> date:
    if not valor:
        return date.today()
    try:
        return datetime.strptime(valor, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError("O campo 'data' deve estar no formato AAAA-MM-DD.")


def _validar_gasto(dados: dict, casal: Casal) -> dict:
    erros = []
    resultado = {}

    integrante_id = dados.get("integrante_id")
    integrante = None
    if integrante_id is None:
        erros.append("O campo 'integrante_id' é obrigatório.")
    else:
        integrante = next((i for i in casal.integrantes if i.id == integrante_id), None)
        if integrante is None:
            erros.append("Esse 'integrante_id' não pertence a esse casal.")
    resultado["integrante_id"] = integrante_id

    descricao = str(dados.get("descricao", "")).strip()
    if not descricao:
        erros.append("O campo 'descricao' é obrigatório.")
    resultado["descricao"] = descricao

    try:
        valor = float(dados.get("valor"))
        if valor <= 0:
            erros.append("O campo 'valor' deve ser maior que zero.")
        resultado["valor"] = valor
    except (TypeError, ValueError):
        erros.append("O campo 'valor' deve ser um número.")

    categoria = str(dados.get("categoria", "")).strip()
    if not categoria:
        erros.append("O campo 'categoria' é obrigatório.")
    resultado["categoria"] = categoria

    try:
        resultado["data"] = _parse_data(dados.get("data"))
    except ValueError as erro:
        erros.append(str(erro))

    if erros:
        raise ValueError(" ".join(erros))
    return resultado


@bp.post("")
def criar_casal():
    """Cria um casal novo e o primeiro integrante.
    ---
    tags:
      - Casal
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [nome]
          properties:
            nome: {type: string, example: "Ana"}
    responses:
      201:
        description: Casal criado, com o código pra compartilhar.
      400:
        description: Payload inválido.
      503:
        description: Muitas pessoas testando ao mesmo tempo, tenta de novo em instantes.
    """
    dados = request.get_json(silent=True) or {}
    try:
        nome = _validar_nome(dados)
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    _limpar_casais_antigos()
    if Casal.query.count() >= _MAX_CASAIS:
        return jsonify({"erro": "Muita gente testando agora, tenta de novo em alguns minutos."}), 503

    casal = Casal(codigo=_gerar_codigo())
    db.session.add(casal)
    db.session.flush()
    integrante = Integrante(casal_id=casal.id, nome=nome)
    db.session.add(integrante)
    db.session.commit()

    return jsonify({
        "codigo": casal.codigo,
        "integrante_id": integrante.id,
        "integrantes": [i.to_dict() for i in casal.integrantes],
    }), 201


@bp.post("/<codigo>/entrar")
def entrar_no_casal(codigo: str):
    """Entra num casal existente usando o código compartilhado.
    ---
    tags:
      - Casal
    parameters:
      - name: codigo
        in: path
        type: string
        required: true
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [nome]
          properties:
            nome: {type: string, example: "Bruno"}
    responses:
      201:
        description: Entrou no casal.
      400:
        description: Esse casal já tem duas pessoas, ou payload inválido.
      404:
        description: Código não encontrado.
    """
    casal = _buscar_casal_ou_none(codigo)
    if casal is None:
        return jsonify({"erro": "Código não encontrado."}), 404

    dados = request.get_json(silent=True) or {}
    try:
        nome = _validar_nome(dados)
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    if len(casal.integrantes) >= MAX_INTEGRANTES_POR_CASAL:
        return jsonify({"erro": "Esse casal já tem duas pessoas."}), 400

    integrante = Integrante(casal_id=casal.id, nome=nome)
    db.session.add(integrante)
    db.session.commit()

    return jsonify({
        "codigo": casal.codigo,
        "integrante_id": integrante.id,
        "integrantes": [i.to_dict() for i in casal.integrantes],
    }), 201


@bp.get("/<codigo>")
def obter_casal(codigo: str):
    """Consulta um casal pelo código (pra saber quem já entrou).
    ---
    tags:
      - Casal
    parameters:
      - name: codigo
        in: path
        type: string
        required: true
    responses:
      200:
        description: Dados do casal.
      404:
        description: Código não encontrado.
    """
    casal = _buscar_casal_ou_none(codigo)
    if casal is None:
        return jsonify({"erro": "Código não encontrado."}), 404
    return jsonify(casal.to_dict())


@bp.get("/<codigo>/gastos")
def listar_gastos_casal(codigo: str):
    """Lista os gastos do casal, mais recentes primeiro.
    ---
    tags:
      - Casal
    parameters:
      - name: codigo
        in: path
        type: string
        required: true
    responses:
      200:
        description: Lista de gastos.
      404:
        description: Código não encontrado.
    """
    casal = _buscar_casal_ou_none(codigo)
    if casal is None:
        return jsonify({"erro": "Código não encontrado."}), 404
    return jsonify([g.to_dict() for g in casal.gastos])


@bp.post("/<codigo>/gastos")
def criar_gasto_casal(codigo: str):
    """Registra um gasto novo do casal.
    ---
    tags:
      - Casal
    parameters:
      - name: codigo
        in: path
        type: string
        required: true
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [integrante_id, descricao, valor, categoria]
          properties:
            integrante_id: {type: integer, example: 1}
            descricao: {type: string, example: "Mercado"}
            valor: {type: number, example: 150.5}
            categoria: {type: string, example: "alimentação"}
            data: {type: string, example: "2026-08-01"}
    responses:
      201:
        description: Gasto criado.
      400:
        description: Payload inválido.
      404:
        description: Código não encontrado.
    """
    casal = _buscar_casal_ou_none(codigo)
    if casal is None:
        return jsonify({"erro": "Código não encontrado."}), 404

    dados = request.get_json(silent=True) or {}
    try:
        limpo = _validar_gasto(dados, casal)
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    gasto = GastoCasal(casal_id=casal.id, **limpo)
    db.session.add(gasto)
    db.session.commit()
    return jsonify(gasto.to_dict()), 201


@bp.delete("/<codigo>/gastos/<int:gasto_id>")
def remover_gasto_casal(codigo: str, gasto_id: int):
    """Remove um gasto do casal.
    ---
    tags:
      - Casal
    parameters:
      - name: codigo
        in: path
        type: string
        required: true
      - name: gasto_id
        in: path
        type: integer
        required: true
    responses:
      204:
        description: Removido com sucesso.
      404:
        description: Código ou gasto não encontrado.
    """
    casal = _buscar_casal_ou_none(codigo)
    if casal is None:
        return jsonify({"erro": "Código não encontrado."}), 404

    gasto = next((g for g in casal.gastos if g.id == gasto_id), None)
    if gasto is None:
        return jsonify({"erro": "Gasto não encontrado."}), 404

    db.session.delete(gasto)
    db.session.commit()
    return "", 204


@bp.get("/<codigo>/saldo")
def saldo_casal(codigo: str):
    """Calcula quem deve quanto pra quem.
    ---
    tags:
      - Casal
    parameters:
      - name: codigo
        in: path
        type: string
        required: true
    responses:
      200:
        description: Saldo entre os dois integrantes.
      404:
        description: Código não encontrado.
    """
    casal = _buscar_casal_ou_none(codigo)
    if casal is None:
        return jsonify({"erro": "Código não encontrado."}), 404

    total = sum(g.valor for g in casal.gastos)
    por_integrante = {i.id: 0.0 for i in casal.integrantes}
    for g in casal.gastos:
        por_integrante[g.integrante_id] = por_integrante.get(g.integrante_id, 0.0) + g.valor

    quantidade = len(casal.integrantes)
    cota = total / quantidade if quantidade else 0.0

    devedor = None
    credor = None
    valor_devido = 0.0
    if quantidade == MAX_INTEGRANTES_POR_CASAL:
        a, b = casal.integrantes
        diferenca = round(por_integrante.get(a.id, 0.0) - por_integrante.get(b.id, 0.0), 2)
        if diferenca > 0.005:
            credor, devedor, valor_devido = a, b, round(diferenca / 2, 2)
        elif diferenca < -0.005:
            credor, devedor, valor_devido = b, a, round(-diferenca / 2, 2)

    return jsonify({
        "total": round(total, 2),
        "cota_por_pessoa": round(cota, 2),
        "gasto_por_integrante": {str(k): round(v, 2) for k, v in por_integrante.items()},
        "quites": devedor is None,
        "devedor": devedor.to_dict() if devedor else None,
        "credor": credor.to_dict() if credor else None,
        "valor_devido": valor_devido,
    })
