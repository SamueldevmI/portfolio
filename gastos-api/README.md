# Controle de Gastos — API

![Testes](https://github.com/SamueldevmI/portfolio/actions/workflows/tests.yml/badge.svg)

Versão backend do [Controle de gastos](../controle-gastos/) do portfólio — é essa API que o front consome direto, com os dados persistidos num banco de verdade (SQLite) por trás de uma API REST feita com Flask.

**Ao vivo:** https://gastos-api-z0dt.onrender.com
**Documentação interativa (Swagger):** https://gastos-api-z0dt.onrender.com/docs

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

A API sobe em `http://127.0.0.1:5000`. A documentação interativa (Swagger UI) fica em `http://127.0.0.1:5000/docs`.

## Rodar os testes

```bash
pytest
```

## Segurança

A API é pública e não tem login, então ela mesma se protege:

- **Limite de pedidos por IP** (`app/limites.py`):

  | Tipo de pedido | Limite |
  |---|---|
  | Leitura | 300 por minuto e 20 mil por dia |
  | Escrita (criar, editar, apagar) | 30 por minuto e 500 por dia |
  | Criar casal | 10 por hora |
  | Código de casal que não existe | 30 por minuto e 200 por dia |

  Acima do limite, a API responde `429`. O limite de código errado impede que alguém descubra o código de um casal chutando.
- **Entrada validada** (`app/validacao.py`):
  - descrição até 140 caracteres e categoria até 60;
  - valor finito entre 0 e 1 bilhão (sem `NaN` nem `Infinity`);
  - corpo do pedido até 16 KB.
- **Código do casal:** gerado com `secrets`, que não é previsível.
- **Cabeçalho:** `X-Content-Type-Options: nosniff` em todas as respostas.
- **Modo debug:** só liga com `FLASK_DEBUG=1`.

O limite é contado por IP. No Render existe um proxy na frente da API, e a variável `PROXIES_NA_FRENTE` (padrão `1`) diz quantos são, pra API enxergar o IP de quem chamou e não o do proxy. Pra rodar sem proxy nenhum, use `PROXIES_NA_FRENTE=0`.

A contagem fica na memória: zera quando o servidor reinicia, e cada processo do gunicorn conta separado. Pra uma demo isso basta; num sistema de verdade, o certo é usar Redis.

Os testes de tudo isso estão em `tests/test_seguranca.py` e `tests/test_limites.py`.

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/gastos` | Lista todos os gastos (aceita `?categoria=` para filtrar) |
| POST | `/gastos` | Cria um gasto — `{descricao, valor, categoria, data, tipo}` (`data` é opcional, AAAA-MM-DD; `tipo` é opcional, `"receita"` ou `"despesa"`, padrão `"despesa"`) |
| GET | `/gastos/<id>` | Busca um gasto pelo id |
| PUT | `/gastos/<id>` | Atualiza um ou mais campos de um gasto |
| DELETE | `/gastos/<id>` | Remove um gasto |
| GET | `/gastos/resumo` | Retorna total geral, quantidade e soma por categoria |
| GET | `/docs` | Documentação interativa (Swagger UI) — testa os endpoints direto do navegador |

### Casal (usado pelo projeto [Conta a Dois](../conta-a-dois/))

Tabelas separadas das de `/gastos` acima — não têm nenhuma relação com seus dados pessoais.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/casal` | Cria um casal novo e o primeiro integrante — `{nome}`. Retorna o código de 6 letras pra compartilhar |
| POST | `/casal/<codigo>/entrar` | Entra num casal existente com o código — `{nome}` (máximo 2 integrantes por casal) |
| GET | `/casal/<codigo>` | Consulta um casal (quem já entrou) |
| GET | `/casal/<codigo>/gastos` | Lista os gastos do casal |
| POST | `/casal/<codigo>/gastos` | Cria um gasto — `{integrante_id, descricao, valor, categoria, data}` |
| DELETE | `/casal/<codigo>/gastos/<id>` | Remove um gasto |
| GET | `/casal/<codigo>/saldo` | Calcula quem deve quanto pra quem |

Casais de demonstração com mais de 30 dias são apagados automaticamente pra não acumular no banco gratuito.

### Exemplo

```bash
curl -X POST http://127.0.0.1:5000/gastos \
  -H "Content-Type: application/json" \
  -d '{"descricao":"Mercado","valor":150.5,"categoria":"alimentação"}'
```

Requisições inválidas (campo faltando, valor negativo etc.) retornam `400` com uma mensagem explicando o motivo.
