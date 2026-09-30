"""Pedidos que um atacante mandaria pra API pública: nada disso pode entrar no banco."""
import pytest

from app import create_app


@pytest.fixture
def client():
    app = create_app("sqlite:///:memory:")
    with app.test_client() as client:
        yield client


def _gasto(**extra):
    base = {"descricao": "Mercado", "valor": 10, "categoria": "casa"}
    base.update(extra)
    return base


def _criar_casal(client):
    corpo = client.post("/casal", json={"nome": "Ana"}).get_json()
    return corpo["codigo"], corpo["integrante_id"]


@pytest.mark.parametrize("campo,tamanho", [("descricao", 141), ("categoria", 61)])
def test_recusa_texto_maior_que_a_coluna(client, campo, tamanho):
    resposta = client.post("/gastos", json=_gasto(**{campo: "a" * tamanho}))
    assert resposta.status_code == 400
    assert client.get("/gastos").get_json() == []


def test_aceita_texto_no_limite(client):
    resposta = client.post("/gastos", json=_gasto(descricao="a" * 140, categoria="b" * 60))
    assert resposta.status_code == 201


@pytest.mark.parametrize("valor", ["NaN", "Infinity", "-Infinity", "nan", "inf", 1e12])
def test_recusa_valor_que_nao_e_numero_de_verdade(client, valor):
    resposta = client.post("/gastos", json=_gasto(valor=valor))
    assert resposta.status_code == 400


def test_recusa_nan_escrito_como_literal_json(client):
    # json.loads do Python aceita NaN sem aspas; o JSON de resposta com NaN quebraria o front
    resposta = client.post("/gastos", data='{"descricao": "x", "valor": NaN, "categoria": "y"}', content_type="application/json")
    assert resposta.status_code == 400


def test_recusa_atualizacao_com_texto_gigante(client):
    gasto_id = client.post("/gastos", json=_gasto()).get_json()["id"]
    resposta = client.put(f"/gastos/{gasto_id}", json={"descricao": "a" * 5000})
    assert resposta.status_code == 400


def test_recusa_corpo_gigante(client):
    resposta = client.post("/gastos", json=_gasto(descricao="a" * 200_000))
    assert resposta.status_code == 413
    assert "erro" in resposta.get_json()


def test_casal_recusa_texto_gigante_e_valor_invalido(client):
    codigo, integrante_id = _criar_casal(client)
    base = {"integrante_id": integrante_id, "descricao": "Mercado", "valor": 10, "categoria": "casa"}
    assert client.post(f"/casal/{codigo}/gastos", json={**base, "descricao": "a" * 141}).status_code == 400
    assert client.post(f"/casal/{codigo}/gastos", json={**base, "categoria": "a" * 61}).status_code == 400
    assert client.post(f"/casal/{codigo}/gastos", json={**base, "valor": "Infinity"}).status_code == 400
    assert client.get(f"/casal/{codigo}/gastos").get_json() == []


def test_respostas_pedem_pro_navegador_nao_adivinhar_o_tipo(client):
    assert client.get("/gastos").headers.get("X-Content-Type-Options") == "nosniff"


def test_codigo_do_casal_usa_gerador_seguro(monkeypatch):
    # random.choice é previsível; o código do casal é a única "senha" do casal
    import app.routes_casal as rotas
    chamadas = []
    monkeypatch.setattr(rotas.secrets, "choice", lambda seq: chamadas.append(1) or seq[0])
    app = create_app("sqlite:///:memory:")
    with app.test_client() as client:
        codigo = client.post("/casal", json={"nome": "Ana"}).get_json()["codigo"]
    assert len(chamadas) == 6 and codigo == "222222"
