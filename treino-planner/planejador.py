import json
import os

ARQUIVO_DADOS = os.path.join(os.path.dirname(__file__), "dados_treino.json")
DIAS_SEMANA = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"]


def carregar_dados():
    if not os.path.exists(ARQUIVO_DADOS):
        return {}
    with open(ARQUIVO_DADOS, "r", encoding="utf-8") as arquivo:
        return json.load(arquivo)


def salvar_dados(dados):
    with open(ARQUIVO_DADOS, "w", encoding="utf-8") as arquivo:
        json.dump(dados, arquivo, ensure_ascii=False, indent=2)


def escolher_dia():
    print("\nDias disponíveis:", ", ".join(DIAS_SEMANA))
    dia = input("Escolha o dia da semana: ").strip().lower()
    while dia not in DIAS_SEMANA:
        dia = input("Dia inválido. Tente novamente: ").strip().lower()
    return dia


def adicionar_treino(dados):
    dia = escolher_dia()
    musculatura = input("Qual musculatura/foco do treino? ").strip()

    exercicios = []
    print("Digite os exercícios (Enter vazio para terminar):")
    while True:
        exercicio = input(f"  Exercício {len(exercicios) + 1}: ").strip()
        if not exercicio:
            if exercicios:
                break
            print("  Adicione pelo menos um exercício.")
            continue
        series = input(f"  Quantas séries de {exercicio}? ").strip()
        exercicios.append({"nome": exercicio, "series": series})

    dados[dia] = {"musculatura": musculatura, "exercicios": exercicios}
    salvar_dados(dados)
    print(f"\nTreino de {dia} salvo com sucesso!")


def listar_treinos(dados):
    if not dados:
        print("\nNenhum treino cadastrado ainda.")
        return

    print("\n=== Seu planejamento semanal ===")
    for dia in DIAS_SEMANA:
        if dia not in dados:
            continue
        treino = dados[dia]
        print(f"\n{dia.capitalize()} — {treino['musculatura']}")
        for exercicio in treino["exercicios"]:
            print(f"  - {exercicio['nome']} ({exercicio['series']} séries)")


def remover_treino(dados):
    if not dados:
        print("\nNenhum treino cadastrado ainda.")
        return

    dia = escolher_dia()
    if dia in dados:
        del dados[dia]
        salvar_dados(dados)
        print(f"\nTreino de {dia} removido.")
    else:
        print(f"\nNão havia treino cadastrado para {dia}.")


def menu():
    dados = carregar_dados()

    opcoes = {
        "1": ("Adicionar/editar treino de um dia", adicionar_treino),
        "2": ("Ver planejamento da semana", listar_treinos),
        "3": ("Remover treino de um dia", remover_treino),
    }

    while True:
        print("\n=== Planejador de Treino Semanal ===")
        for chave, (descricao, _) in opcoes.items():
            print(f"{chave}. {descricao}")
        print("4. Sair")

        escolha = input("Escolha uma opção: ").strip()

        if escolha == "4":
            print("Bons treinos!")
            break
        elif escolha in opcoes:
            opcoes[escolha][1](dados)
        else:
            print("Opção inválida, tente de novo.")


if __name__ == "__main__":
    menu()
