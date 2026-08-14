# Controle de Gastos — API

![Testes](https://github.com/SamueldevmI/portfolio/actions/workflows/tests.yml/badge.svg)

Versão backend do [Controle de gastos](../controle-gastos/) do portfólio — é essa API que o front consome direto, com os dados persistidos num banco de verdade (SQLite) por trás de uma API REST feita com Flask.

**Ao vivo:** https://gastos-api-z0dt.onrender.com

> Hospedado no plano gratuito do Render — se ninguém acessar por um tempo, a instância "dorme" e a primeira requisição depois disso pode levar uns 50 segundos pra responder. As próximas são rápidas.

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
| POST | `/gastos` | Cria um gasto — `{descricao, valor, categoria, data, tipo}` (`data` é opcional, AAAA-MM-DD; `tipo` é opcional, `"receita"` ou `"despesa"`, padrão `"despesa"`) |
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
