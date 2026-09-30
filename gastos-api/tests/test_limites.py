"""Limite de pedidos por endereço: a API é pública e sem login."""
import pytest

from app import create_app


@pytest.fixture
def client():
    app = create_app("sqlite:///:memory:")
    with app.test_client() as client:
        yield client


GASTO = {"descricao": "Mercado", "valor": 10, "categoria": "casa"}


def test_escrita_para_depois_de_30_por_minuto(client):
    for _ in range(30):
        assert client.post("/gastos", json=GASTO).status_code == 201
    resposta = client.post("/gastos", json=GASTO)
    assert resposta.status_code == 429
    assert "erro" in resposta.get_json()
    # ler continua liberado: o limite de escrita é separado
    assert client.get("/gastos").status_code == 200


def test_cada_endereco_tem_o_proprio_limite(client):
    for _ in range(30):
        client.post("/gastos", json=GASTO, environ_base={"REMOTE_ADDR": "10.0.0.1"})
    assert client.post("/gastos", json=GASTO, environ_base={"REMOTE_ADDR": "10.0.0.1"}).status_code == 429
    assert client.post("/gastos", json=GASTO, environ_base={"REMOTE_ADDR": "10.0.0.2"}).status_code == 201


def test_leitura_aguenta_o_conta_a_dois_em_duas_abas(client):
    # o Conta a Dois faz 3 consultas a cada 4 s por aba: 90 por minuto com o par aberto na outra aba
    codigo = client.post("/casal", json={"nome": "Ana"}).get_json()["codigo"]
    for _ in range(30):
        for caminho in (f"/casal/{codigo}", f"/casal/{codigo}/gastos", f"/casal/{codigo}/saldo"):
            assert client.get(caminho).status_code == 200


def test_permissao_do_navegador_nao_conta(client):
    # antes de cada chamada com JSON o navegador manda um OPTIONS; isso não pode gastar o limite
    for _ in range(400):
        client.options("/gastos", headers={"Origin": "https://samueldevmi.github.io", "Access-Control-Request-Method": "POST"})
    assert client.get("/gastos").status_code == 200


def test_criar_casal_para_depois_de_10_por_hora(client):
    for _ in range(10):
        assert client.post("/casal", json={"nome": "Ana"}).status_code == 201
    assert client.post("/casal", json={"nome": "Ana"}).status_code == 429


def test_chutar_codigo_de_casal_para_depois_de_30_erros(client):
    for i in range(30):
        assert client.get(f"/casal/ZZZ{i:03d}").status_code == 404
    assert client.get("/casal/ZZZ999").status_code == 429


def test_codigo_certo_nao_gasta_o_limite_de_erro(client):
    codigo = client.post("/casal", json={"nome": "Ana"}).get_json()["codigo"]
    for _ in range(60):
        assert client.get(f"/casal/{codigo}").status_code == 200
