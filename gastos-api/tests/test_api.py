import pytest

from app import create_app
from app.database import db


@pytest.fixture
def client():
    app = create_app("sqlite:///:memory:")
    with app.test_client() as client:
        yield client


def test_raiz_responde_ok(client):
    resposta = client.get("/")
    assert resposta.status_code == 200


def test_lista_vazia_no_inicio(client):
    resposta = client.get("/gastos")
    assert resposta.status_code == 200
    assert resposta.get_json() == []


def test_cria_gasto(client):
    resposta = client.post("/gastos", json={
        "descricao": "Mercado",
        "valor": 150.5,
        "categoria": "alimentação",
        "data": "2026-08-01",
    })
    assert resposta.status_code == 201
    corpo = resposta.get_json()
    assert corpo["descricao"] == "Mercado"
    assert corpo["valor"] == 150.5
    assert corpo["tipo"] == "despesa"
    assert "id" in corpo


def test_cria_receita(client):
    resposta = client.post("/gastos", json={
        "descricao": "Salário", "valor": 3000, "categoria": "trabalho", "tipo": "receita",
    })
    assert resposta.status_code == 201
    assert resposta.get_json()["tipo"] == "receita"


def test_cria_gasto_com_tipo_invalido_falha(client):
    resposta = client.post("/gastos", json={
        "descricao": "Erro", "valor": 10, "categoria": "lazer", "tipo": "investimento",
    })
    assert resposta.status_code == 400


def test_cria_gasto_sem_descricao_falha(client):
    resposta = client.post("/gastos", json={"valor": 10, "categoria": "lazer"})
    assert resposta.status_code == 400
    assert "erro" in resposta.get_json()


def test_cria_gasto_com_valor_negativo_falha(client):
    resposta = client.post("/gastos", json={
        "descricao": "Erro proposital", "valor": -5, "categoria": "lazer",
    })
    assert resposta.status_code == 400


def test_obter_gasto_inexistente_retorna_404(client):
    resposta = client.get("/gastos/999")
    assert resposta.status_code == 404


def test_atualizar_gasto(client):
    criado = client.post("/gastos", json={
        "descricao": "Cinema", "valor": 40, "categoria": "lazer",
    }).get_json()

    resposta = client.put(f"/gastos/{criado['id']}", json={"valor": 60})
    assert resposta.status_code == 200
    assert resposta.get_json()["valor"] == 60
    assert resposta.get_json()["descricao"] == "Cinema"


def test_remover_gasto(client):
    criado = client.post("/gastos", json={
        "descricao": "Assinatura", "valor": 30, "categoria": "streaming",
    }).get_json()

    resposta = client.delete(f"/gastos/{criado['id']}")
    assert resposta.status_code == 204
    assert client.get(f"/gastos/{criado['id']}").status_code == 404


def test_filtra_por_categoria(client):
    client.post("/gastos", json={"descricao": "Uber", "valor": 20, "categoria": "transporte"})
    client.post("/gastos", json={"descricao": "Pizza", "valor": 50, "categoria": "alimentação"})

    resposta = client.get("/gastos?categoria=transporte")
    corpo = resposta.get_json()
    assert len(corpo) == 1
    assert corpo[0]["descricao"] == "Uber"


def test_resumo_soma_por_categoria(client):
    client.post("/gastos", json={"descricao": "A", "valor": 100, "categoria": "casa"})
    client.post("/gastos", json={"descricao": "B", "valor": 50, "categoria": "casa"})
    client.post("/gastos", json={"descricao": "C", "valor": 30, "categoria": "lazer"})

    resposta = client.get("/gastos/resumo")
    corpo = resposta.get_json()
    assert corpo["total"] == 180
    assert corpo["quantidade"] == 3
    assert corpo["por_categoria"]["casa"] == 150
    assert corpo["por_categoria"]["lazer"] == 30
