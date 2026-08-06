from __future__ import annotations

from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.prompt import IntPrompt, Prompt
from rich.table import Table

from .core import DIAS_SEMANA, DiaInvalidoError, Exercicio, PlanejadorTreino, TreinoNaoEncontradoError

console = Console()
ARQUIVO_DADOS = Path(__file__).resolve().parent.parent / "dados_treino.json"


def pedir_dia() -> str:
    dia = Prompt.ask("Dia da semana", choices=DIAS_SEMANA)
    return dia


def confirmar(pergunta: str, padrao: bool = False) -> bool:
    sufixo = "[S/n]" if padrao else "[s/N]"
    resposta = Prompt.ask(f"{pergunta} {sufixo}", default="s" if padrao else "n", show_default=False)
    return resposta.strip().lower() in ("s", "sim")


def acao_adicionar(planejador: PlanejadorTreino) -> None:
    dia = pedir_dia()
    musculatura = Prompt.ask("Foco do treino (ex: peito, costas, pernas)")

    exercicios: list[Exercicio] = []
    console.print("[dim]Digite os exercícios. Deixe o nome em branco para terminar.[/dim]")
    while True:
        nome = Prompt.ask(f"  Exercício {len(exercicios) + 1}", default="", show_default=False)
        if not nome:
            if exercicios:
                break
            console.print("[yellow]Adicione pelo menos um exercício.[/yellow]")
            continue
        series = IntPrompt.ask(f"  Séries de {nome}", default=3)
        exercicios.append(Exercicio(nome=nome, series=series))

    planejador.definir_treino(dia, musculatura, exercicios)
    console.print(f"[bold green]OK[/bold green] Treino de {dia} salvo com sucesso.")


def acao_listar(planejador: PlanejadorTreino) -> None:
    semana = planejador.semana()
    if not semana:
        console.print("[yellow]Nenhum treino cadastrado ainda.[/yellow]")
        return

    for dia, treino in semana.items():
        tabela = Table(title=f"{dia.capitalize()} — {treino.musculatura}", title_style="bold cyan")
        tabela.add_column("Exercício", style="white")
        tabela.add_column("Séries", justify="right", style="cyan")
        for exercicio in treino.exercicios:
            tabela.add_row(exercicio.nome, str(exercicio.series))
        console.print(tabela)


def acao_remover(planejador: PlanejadorTreino) -> None:
    dia = pedir_dia()
    if not confirmar(f"Remover o treino de {dia}?"):
        return
    try:
        planejador.remover_treino(dia)
        console.print(f"[bold green]OK[/bold green] Treino de {dia} removido.")
    except TreinoNaoEncontradoError as erro:
        console.print(f"[yellow]{erro}[/yellow]")


def menu() -> None:
    planejador = PlanejadorTreino(ARQUIVO_DADOS)
    opcoes = {
        "1": ("Adicionar/editar treino de um dia", acao_adicionar),
        "2": ("Ver planejamento da semana", acao_listar),
        "3": ("Remover treino de um dia", acao_remover),
    }

    console.print(Panel.fit(
        "[bold]Planejador de Treino Semanal[/bold]",
        subtitle="dados salvos localmente em JSON",
        border_style="cyan",
    ))

    while True:
        console.print()
        for chave, (descricao, _) in opcoes.items():
            console.print(f"  [cyan]{chave}[/cyan]. {descricao}")
        console.print("  [cyan]4[/cyan]. Sair")

        escolha = Prompt.ask("\nEscolha uma opção", choices=[*opcoes.keys(), "4"], show_choices=False)

        if escolha == "4":
            console.print("[bold cyan]Bons treinos![/bold cyan]")
            break

        try:
            opcoes[escolha][1](planejador)
        except DiaInvalidoError as erro:
            console.print(f"[red]{erro}[/red]")


if __name__ == "__main__":
    menu()
