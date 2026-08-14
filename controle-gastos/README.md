# Controle de gastos

Aplicação interativa para acompanhar gastos, com resumo financeiro, filtros e persistência de verdade: o front consome a [API REST em Flask](../gastos-api/) deste mesmo portfólio.

**Ao vivo:** https://samueldevmi.github.io/portfolio/controle-gastos/

> Plano gratuito do Render: se a API estiver "dormindo", a primeira ação pode levar até ~50s. A tela mostra esse aviso enquanto carrega.

## Tecnologias

JavaScript, Fetch API, [Flask REST API](../gastos-api/)

## Como rodar

Abra o `index.html` direto no navegador — não depende de servidor ou build local. As transações são lidas e salvas na API hospedada em produção (`https://gastos-api-z0dt.onrender.com`).
