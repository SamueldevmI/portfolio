from datetime import datetime, timedelta

import pytest

from app import create_app
from app.database import db
from app.models_casal import Casal


@pytest.fixture
def app():
    app = create_app("sqlite:///:memory:")
    yield app


@pytest.fixture
def client(app):
    with app.test_client() as client:
        yield client


def _criar_casal(client, nome="Ana"):
    return client.post("/casal", json={"nome": nome}).get_json()


def test_cria_casal_gera_codigo_de_6_caracteres(client):
    resposta = client.post("/casal", json={"nome": "Ana"})
    assert resposta.status_code == 201
    corpo = resposta.get_json()
    assert len(corpo["codigo"]) == 6
    assert len(corpo["integrantes"]) == 1
    assert corpo["integrantes"][0]["nome"] == "Ana"


def test_cria_casal_sem_nome_falha(client):
    resposta = client.post("/casal", json={})
    assert resposta.status_code == 400


def test_entrar_com_codigo_valido(client):
    criado = _criar_casal(client, "Ana")
    resposta = client.post(f"/casal/{criado['codigo']}/entrar", json={"nome": "Bruno"})
    assert resposta.status_code == 201
    corpo = resposta.get_json()
    assert len(corpo["integrantes"]) == 2
    nomes = {i["nome"] for i in corpo["integrantes"]}
    assert nomes == {"Ana", "Bruno"}


def test_entrar_com_codigo_minusculo_funciona(client):
    criado = _criar_casal(client, "Ana")
    resposta = client.post(f"/casal/{criado['codigo'].lower()}/entrar", json={"nome": "Bruno"})
    assert resposta.status_code == 201


def test_entrar_com_codigo_inexistente_da_404(client):
    resposta = client.post("/casal/ZZZZZZ/entrar", json={"nome": "Bruno"})
    assert resposta.status_code == 404


def test_terceira_pessoa_nao_entra(client):
    criado = _criar_casal(client, "Ana")
    client.post(f"/casal/{criado['codigo']}/entrar", json={"nome": "Bruno"})
    resposta = client.post(f"/casal/{criado['codigo']}/entrar", json={"nome": "Carlos"})
    assert resposta.status_code == 400


def test_consulta_casal(client):
    criado = _criar_casal(client, "Ana")
    resposta = client.get(f"/casal/{criado['codigo']}")
    assert resposta.status_code == 200
    assert resposta.get_json()["codigo"] == criado["codigo"]


def test_consulta_casal_inexistente_da_404(client):
    resposta = client.get("/casal/ZZZZZZ")
    assert resposta.status_code == 404


def test_cria_gasto_do_casal(client):
    criado = _criar_casal(client, "Ana")
    integrante_id = criado["integrantes"][0]["id"]
    resposta = client.post(f"/casal/{criado['codigo']}/gastos", json={
        "integrante_id": integrante_id, "descricao": "Mercado", "valor": 100, "categoria": "casa",
    })
    assert resposta.status_code == 201
    corpo = resposta.get_json()
    assert corpo["descricao"] == "Mercado"
    assert corpo["integrante_nome"] == "Ana"


def test_cria_gasto_com_integrante_de_outro_casal_falha(client):
    casal_a = _criar_casal(client, "Ana")
    casal_b = _criar_casal(client, "Carla")
    id_de_outro_casal = casal_b["integrantes"][0]["id"]

    resposta = client.post(f"/casal/{casal_a['codigo']}/gastos", json={
        "integrante_id": id_de_outro_casal, "descricao": "Mercado", "valor": 100, "categoria": "casa",
    })
    assert resposta.status_code == 400


def test_cria_gasto_com_valor_negativo_falha(client):
    criado = _criar_casal(client, "Ana")
    integrante_id = criado["integrantes"][0]["id"]
    resposta = client.post(f"/casal/{criado['codigo']}/gastos", json={
        "integrante_id": integrante_id, "descricao": "Erro", "valor": -10, "categoria": "casa",
    })
    assert resposta.status_code == 400


def test_lista_gastos_ordenados_mais_recente_primeiro(client):
    criado = _criar_casal(client, "Ana")
    integrante_id = criado["integrantes"][0]["id"]
    client.post(f"/casal/{criado['codigo']}/gastos", json={
        "integrante_id": integrante_id, "descricao": "Primeiro", "valor": 10, "categoria": "casa",
    })
    client.post(f"/casal/{criado['codigo']}/gastos", json={
        "integrante_id": integrante_id, "descricao": "Segundo", "valor": 20, "categoria": "casa",
    })
    resposta = client.get(f"/casal/{criado['codigo']}/gastos")
    corpo = resposta.get_json()
    assert len(corpo) == 2
    assert corpo[0]["descricao"] == "Segundo"


def test_remove_gasto_do_casal(client):
    criado = _criar_casal(client, "Ana")
    integrante_id = criado["integrantes"][0]["id"]
    gasto = client.post(f"/casal/{criado['codigo']}/gastos", json={
        "integrante_id": integrante_id, "descricao": "Cinema", "valor": 40, "categoria": "lazer",
    }).get_json()

    resposta = client.delete(f"/casal/{criado['codigo']}/gastos/{gasto['id']}")
    assert resposta.status_code == 204
    assert client.get(f"/casal/{criado['codigo']}/gastos").get_json() == []


def test_remove_gasto_inexistente_da_404(client):
    criado = _criar_casal(client, "Ana")
    resposta = client.delete(f"/casal/{criado['codigo']}/gastos/999")
    assert resposta.status_code == 404


def test_saldo_quites_quando_gastam_igual(client):
    criado = _criar_casal(client, "Ana")
    ana_id = criado["integrantes"][0]["id"]
    entrou = client.post(f"/casal/{criado['codigo']}/entrar", json={"nome": "Bruno"}).get_json()
    bruno_id = next(i["id"] for i in entrou["integrantes"] if i["nome"] == "Bruno")

    client.post(f"/casal/{criado['codigo']}/gastos", json={
        "integrante_id": ana_id, "descricao": "Mercado", "valor": 100, "categoria": "casa",
    })
    client.post(f"/casal/{criado['codigo']}/gastos", json={
        "integrante_id": bruno_id, "descricao": "Luz", "valor": 100, "categoria": "casa",
    })

    resposta = client.get(f"/casal/{criado['codigo']}/saldo")
    corpo = resposta.get_json()
    assert corpo["quites"] is True
    assert corpo["total"] == 200


def test_saldo_calcula_quem_deve_pra_quem(client):
    criado = _criar_casal(client, "Ana")
    ana_id = criado["integrantes"][0]["id"]
    entrou = client.post(f"/casal/{criado['codigo']}/entrar", json={"nome": "Bruno"}).get_json()
    bruno_id = next(i["id"] for i in entrou["integrantes"] if i["nome"] == "Bruno")

    # Ana pagou 150, Bruno pagou 50: total 200, cota 100 cada.
    # Ana está 50 acima da cota -> Bruno deve 50 pra Ana.
    client.post(f"/casal/{criado['codigo']}/gastos", json={
        "integrante_id": ana_id, "descricao": "Mercado", "valor": 150, "categoria": "casa",
    })
    client.post(f"/casal/{criado['codigo']}/gastos", json={
        "integrante_id": bruno_id, "descricao": "Luz", "valor": 50, "categoria": "casa",
    })

    resposta = client.get(f"/casal/{criado['codigo']}/saldo")
    corpo = resposta.get_json()
    assert corpo["quites"] is False
    assert corpo["credor"]["nome"] == "Ana"
    assert corpo["devedor"]["nome"] == "Bruno"
    assert corpo["valor_devido"] == 50


def test_saldo_de_casal_inexistente_da_404(client):
    resposta = client.get("/casal/ZZZZZZ/saldo")
    assert resposta.status_code == 404


def test_saldo_com_uma_pessoa_so_nao_calcula_divida(client):
    criado = _criar_casal(client, "Ana")
    ana_id = criado["integrantes"][0]["id"]
    client.post(f"/casal/{criado['codigo']}/gastos", json={
        "integrante_id": ana_id, "descricao": "Mercado", "valor": 100, "categoria": "casa",
    })
    resposta = client.get(f"/casal/{criado['codigo']}/saldo")
    corpo = resposta.get_json()
    assert corpo["devedor"] is None
    assert corpo["total"] == 100


def test_casal_antigo_e_limpo_ao_criar_um_novo(app, client):
    _criar_casal(client, "Ana")
    with app.app_context():
        antigo = Casal.query.first()
        antigo.criado_em = datetime.utcnow() - timedelta(days=31)
        db.session.commit()

    _criar_casal(client, "Carla")

    with app.app_context():
        codigos = {c.codigo for c in Casal.query.all()}
        assert len(codigos) == 1


def test_codigo_de_casal_recente_nao_e_apagado(client):
    criado = _criar_casal(client, "Ana")
    _criar_casal(client, "Carla")
    resposta = client.get(f"/casal/{criado['codigo']}")
    assert resposta.status_code == 200
