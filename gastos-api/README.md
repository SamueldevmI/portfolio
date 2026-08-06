# Controle de Gastos — API

Versão backend do [Controle de gastos](../controle-gastos/) do portfólio: em vez de salvar no navegador (LocalStorage), os dados ficam num banco de verdade (SQLite) por trás de uma API REST feita com Flask.

## Estrutura

```
gastos-api/
├── run.py                # ponto de entrada
├── app/
│   ├── __init__.py        # app factory (cria e configura o Flask)
│   ├── database.py        # instância do SQLAlchemy
│   ├── models.py          # modelo Gasto
│   └── routes.py          # endpoints da API
└── tests/
    └── test_api.py        # testes automatizados (pytest)
```

## Como rodar

```bash
pip install -r requirements.txt
python run.py
```

A API sobe em `http://127.0.0.1:5000`.

## Rodar os testes

```bash
pytest
```

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/gastos` | Lista todos os gastos (aceita `?categoria=` para filtrar) |
| POST | `/gastos` | Cria um gasto — `{descricao, valor, categoria, data}` (`data` é opcional, AAAA-MM-DD) |
| GET | `/gastos/<id>` | Busca um gasto pelo id |
| PUT | `/gastos/<id>` | Atualiza um ou mais campos de um gasto |
| DELETE | `/gastos/<id>` | Remove um gasto |
| GET | `/gastos/resumo` | Retorna total geral, quantidade e soma por categoria |

### Exemplo

```bash
curl -X POST http://127.0.0.1:5000/gastos \
  -H "Content-Type: application/json" \
  -d '{"descricao":"Mercado","valor":150.5,"categoria":"alimentação"}'
```

Requisições inválidas (campo faltando, valor negativo etc.) retornam `400` com uma mensagem explicando o motivo.
