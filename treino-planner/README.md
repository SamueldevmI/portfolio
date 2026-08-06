# Planejador de Treino Semanal

Script em Python, via terminal, para montar e consultar uma rotina de treinos da semana. Os dados ficam salvos em JSON, então o planejamento continua salvo entre execuções.

## Como rodar

```bash
python planejador.py
```

## Funcionalidades

- Adicionar ou editar o treino de um dia da semana (musculatura + lista de exercícios com séries)
- Listar o planejamento completo da semana
- Remover o treino de um dia específico
- Persistência local em `dados_treino.json`
