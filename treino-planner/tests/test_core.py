import pytest

from planejador.core import DiaInvalidoError, Exercicio, PlanejadorTreino, TreinoNaoEncontradoError


@pytest.fixture
def planejador(tmp_path):
    return PlanejadorTreino(tmp_path / "dados_treino.json")


def test_novo_planejador_esta_vazio(planejador):
    assert len(planejador) == 0
    assert planejador.semana() == {}


def test_definir_treino_adiciona_e_persiste(tmp_path):
    arquivo = tmp_path / "dados_treino.json"
    planejador = PlanejadorTreino(arquivo)

    planejador.definir_treino("segunda", "peito", [Exercicio("supino", 4)])

    assert arquivo.exists()
    recarregado = PlanejadorTreino(arquivo)
    treino = recarregado.obter_treino("segunda")
    assert treino.musculatura == "peito"
    assert treino.exercicios == [Exercicio("supino", 4)]


def test_definir_treino_aceita_dia_com_acento_e_maiusculas(planejador):
    planejador.definir_treino("SEGUNDA", "pernas", [Exercicio("agachamento", 4)])
    assert planejador.obter_treino("segunda") is not None


def test_dia_invalido_levanta_erro(planejador):
    with pytest.raises(DiaInvalidoError):
        planejador.definir_treino("feriado", "peito", [Exercicio("supino", 4)])


def test_treino_sem_exercicios_levanta_erro(planejador):
    with pytest.raises(ValueError):
        planejador.definir_treino("segunda", "peito", [])


def test_remover_treino_existente(planejador):
    planejador.definir_treino("terça", "costas", [Exercicio("remada", 3)])
    planejador.remover_treino("terça")
    assert planejador.obter_treino("terça") is None


def test_remover_treino_inexistente_levanta_erro(planejador):
    with pytest.raises(TreinoNaoEncontradoError):
        planejador.remover_treino("quarta")


def test_semana_respeita_ordem_dos_dias(planejador):
    planejador.definir_treino("sexta", "ombro", [Exercicio("desenvolvimento", 4)])
    planejador.definir_treino("segunda", "peito", [Exercicio("supino", 4)])

    assert list(planejador.semana().keys()) == ["segunda", "sexta"]
