from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path

DIAS_SEMANA: list[str] = [
    "segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo",
]


class DiaInvalidoError(ValueError):
    pass


class TreinoNaoEncontradoError(KeyError):
    pass


@dataclass
class Exercicio:
    nome: str
    series: int

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "Exercicio":
        return cls(nome=data["nome"], series=int(data["series"]))


@dataclass
class Treino:
    musculatura: str
    exercicios: list[Exercicio] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "musculatura": self.musculatura,
            "exercicios": [e.to_dict() for e in self.exercicios],
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Treino":
        return cls(
            musculatura=data["musculatura"],
            exercicios=[Exercicio.from_dict(e) for e in data.get("exercicios", [])],
        )


class PlanejadorTreino:
    def __init__(self, arquivo_dados: Path | str) -> None:
        self.arquivo_dados = Path(arquivo_dados)
        self._treinos: dict[str, Treino] = self._carregar()

    def _carregar(self) -> dict[str, Treino]:
        if not self.arquivo_dados.exists():
            return {}
        with self.arquivo_dados.open("r", encoding="utf-8") as f:
            bruto = json.load(f)
        return {dia: Treino.from_dict(t) for dia, t in bruto.items()}

    def salvar(self) -> None:
        bruto = {dia: treino.to_dict() for dia, treino in self._treinos.items()}
        with self.arquivo_dados.open("w", encoding="utf-8") as f:
            json.dump(bruto, f, ensure_ascii=False, indent=2)

    @staticmethod
    def validar_dia(dia: str) -> str:
        dia = dia.strip().lower()
        if dia not in DIAS_SEMANA:
            raise DiaInvalidoError(f"'{dia}' não é um dia válido. Use: {', '.join(DIAS_SEMANA)}")
        return dia

    def definir_treino(self, dia: str, musculatura: str, exercicios: list[Exercicio]) -> Treino:
        dia = self.validar_dia(dia)
        if not exercicios:
            raise ValueError("Um treino precisa de pelo menos um exercício.")
        treino = Treino(musculatura=musculatura, exercicios=exercicios)
        self._treinos[dia] = treino
        self.salvar()
        return treino

    def remover_treino(self, dia: str) -> None:
        dia = self.validar_dia(dia)
        if dia not in self._treinos:
            raise TreinoNaoEncontradoError(f"Não há treino cadastrado para {dia}.")
        del self._treinos[dia]
        self.salvar()

    def obter_treino(self, dia: str) -> Treino | None:
        dia = self.validar_dia(dia)
        return self._treinos.get(dia)

    def semana(self) -> dict[str, Treino]:
        return {dia: self._treinos[dia] for dia in DIAS_SEMANA if dia in self._treinos}

    def __len__(self) -> int:
        return len(self._treinos)
