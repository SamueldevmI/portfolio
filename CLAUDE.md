# Portfólio do Samuel Mickael: manual pra quem mexe no site

Site estático (HTML, CSS e JavaScript puros, sem framework) publicado pelo GitHub Pages em
https://samueldevmi.github.io/portfolio/. O que chega na `main` vai pro ar em 1 ou 2 minutos, **sem esperar
os testes**. Por isso as regras de publicação abaixo valem sempre.

Mais de uma sessão do Claude trabalha neste site ao mesmo tempo. Leia isto antes de mexer.

## Regras de publicação (obrigatórias)

1. Antes de subir: `git fetch origin main && git merge origin/main`.
2. **Se o merge tiver conflito, resolva à mão e confira que não sobrou nada:** `git diff --name-only --diff-filter=U`
   tem que sair vazio. Nunca use `git commit -a` com conflito pendente: ele grava as marcas `<<<<<<<` e vai pro ar.
   Em `index.html`, conflito costuma ser só o número de versão (`?v=`): fique com um número novo, maior que os dois.
3. Rode as conferências e o teste do site. **Só suba se tudo passar:**
   ```sh
   node ferramentas/gerar-tema-azul.js --conferir
   node ferramentas/gerar-paginas-ramo.js --conferir
   node ferramentas/gerar-paginas-conteudo.js --conferir
   NODE_PATH=$(npm root -g) CHROMIUM=/opt/pw-browsers/chromium node ferramentas/testar-site.js
   ```
4. Mexeu em CSS ou JS da página inicial? Troque o número de versão em **todas** as ocorrências de `?v=` do
   `index.html` (são 9; `servicos.js` e `depoimentos.js` têm a versão própria). Sem isso o celular do visitante
   continua com o arquivo velho.
5. Suba o branch e a main: `git push -u origin <branch> && git push origin HEAD:main`. Depois confira o site no ar
   e o resultado do workflow "Testes".

## Geradores (nunca edite à mão o que eles geram)

| Comando | Gera | A partir de |
|---|---|---|
| `node ferramentas/gerar-tema-azul.js` | `style-azul.css`, `style-cerrado.css`, `style-neon.css`, `style-gibi85.css` | `style.css` |
| `node ferramentas/gerar-paginas-ramo.js` | `site-para-*/index.html` | `servicos.js` e `previa-celular.js` |
| `node ferramentas/gerar-paginas-conteudo.js` | `criacao-de-sites-campo-grande/`, `dicas/` e os artigos, `como-foi-feito/`, `how-it-was-built/`, `para-agencias/` | o próprio arquivo e `servicos.js` |
| `NODE_PATH=$(npm root -g) node ferramentas/gerar-og.js` | `imagem/og/*.jpg` (prévia do link no WhatsApp) | lista no arquivo |
| `NODE_PATH=$(npm root -g) node ferramentas/gerar-carrosseis.js` | `instagram/` (carrosséis e legendas) | lista no arquivo |

- **Mexeu no `style.css`?** Rode o gerador de temas.
- **Mudou preço ou pacote no `servicos.js`?** Rode os dois geradores de páginas.
- **Artigo novo?** Entra no `ARTIGOS` do gerador de conteúdo, no `gerar-og.js`, no `gerar-carrosseis.js` (se tiver carrossel) e no `sitemap.xml`.

## Como o site está montado

- **Página inicial:** `index.html`, com o estilo em `style.css`.
  - Scripts essenciais com `defer`: `estatisticas.js`, `servicos.js`, `previa-celular.js`, `filme-celular.js`, `depoimentos.js`, `script.js`, `antes-depois.js`, `idioma-leve.js`.
  - Scripts carregados depois que a página abre (lista no fim do `index.html`): `acabamento.js`, `ficha.js`, `gibi.js`, `visual.js`, `figurinhas.js`, `mobile.js` (só celular) e `musica.js`.
- **Temas:** vermelho (padrão), azul, cerrado, neon e gibi85.
  - A escolha fica em `localStorage["portfolio-tema"]`, é lida no `<head>` de cada página e vira `html[data-tema]`.
  - O menu de temas está no `script.js`.
  - Linha de CSS com o comentário `manter-cor` não é recolorida pelo gerador.
- **Modos:**
  - `html.modo-leve` liga sozinho em celular e internet lenta.
  - `html.modo-simples` é a "Versão leve" do botão no rodapé: faz tudo responder como "menos movimento" e não carrega a música.
- **Cor pelo ramo:** `html[data-ramo-cor]` (definido no `antes-depois.js`) troca `--cyan`, `--pink` e `--acento-texto`.
- **Espanhol:** `idioma.js` traduz o texto da página pelo `DICIONARIO`. Texto novo fixo no `index.html` precisa de entrada lá. Texto escrito por JS usa `window.traduzir("...")`.
- **Seções:** usam `content-visibility: auto`. Elemento fora da caixa da seção é cortado, e a numeração das seções é fixa por id (não use contador de CSS).
- **Animações:**
  - Só `transform` e `opacity`, nada de filtro ou sobreposição pesada animando o tempo todo.
  - Respeite `prefers-reduced-motion`.
  - **Nada pode mudar a altura da página depois que ela abriu**: no iPhone isso faz a tela pular. Reserve o espaço no HTML ou no CSS.
- **Ferramentas do Samuel** (escondidas do Google): `prospeccao.html` (links personalizados, mensagens prontas, proposta e depoimento), `painel.html`, `apresentar.html` e `instagram/`.

## O que nunca fazer

- **Inventar fato pessoal do Samuel** (hobby, ponto fraco, número de clientes, horário de atendimento) ou depoimento. Só o que ele contou.
- **Inventar preço, promoção, prazo ou condição comercial.** Preço vem do `servicos.js`. Novidade comercial é decisão dele.
  - Estão prontos e desligados até ele decidir: o Plano Tranquilidade (`hidden`), as vagas do mês (`hidden`), o vídeo de apresentação (`hidden`) e o prêmio do álbum.
- **Citar dado de outra empresa** (taxa do iFood, preço do Wix) como se fosse certo.
- **Mexer no "noindex" da loja da Eclipse Studio** ou espelhar a câmera em qualquer recurso.
- **Rodar `playwright install` aqui:** o Chromium já está em `/opt/pw-browsers/chromium`. No GitHub o workflow instala sozinho.

## Pendências que dependem do Samuel

- Código do GoatCounter (`CODIGO` em `estatisticas.js`).
- Tag do Google Search Console (lugar marcado no `<head>` do `index.html`).
- Passo a passo do GoatCounter, do Search Console e do Perfil da Empresa: `ferramentas/passo-a-passo-google.md`.
