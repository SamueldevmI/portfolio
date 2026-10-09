# Lançamento da Eclipse Studio

Quando a vitrine tiver só as peças reais (fotos, nomes e preços da Elizabeth):

1. **script.js:** troque as peças de exemplo pelas reais em `PRODUTOS` (foto em `fotos/`, campo `foto`) e ajuste `ESTILOS_DAS_PECAS` e `LOOKS`.
2. **script.js:** mude `demo: true` para `demo: false` (a mensagem do pedido para de dizer "pedido de teste").
3. **index.html:** troque `<meta name="robots" content="noindex">` por `<meta name="robots" content="index, follow">` e tire a faixa "Prévia".
4. **sitemap.xml (raiz do portfólio):** acrescente `<url><loc>https://samueldevmi.github.io/portfolio/eclipse-studio/</loc></url>`.
5. Refaça `compartilhar.png` e o kit do Instagram (`kit/`) com as fotos reais.
6. Fora do site: criar o **Perfil da Empresa no Google** (Google Meu Negócio) da Eclipse Studio em Campo Grande, com o link da loja, o Instagram e o WhatsApp. É o que mais ajuda a aparecer em "loja alternativa Campo Grande".

A ficha (`ficha/`) continua com `noindex` sempre.

## Repaginada (out/2026): o que conferir com a Elizabeth

- **Taxas de entrega por região** (`LOJA.entregas` no script.js): os valores atuais são de exemplo. Confirmar com ela e ajustar (em centavos).
- **Peça única** (`unica: true` na peça): achados de brechó ganham o selo dourado e só dá pra pôr 1 na sacola. Marcar nas peças reais.
- **Fotos**: `fotos: ["fotos/x-frente.jpg", "fotos/x-vestida.jpg"]` na peça. A 2ª aparece ao passar o mouse e a janela da peça vira galeria. O guia pra ela tirar as fotos está em `fotos/index.html` (link também na ficha).
- **Quem já é da coven** (`DEPOIMENTOS` no script.js): prints e elogios de clientes. A seção só aparece quando tiver pelo menos um.
- **Lista do drop**: o botão "Me avisa no próximo drop" manda mensagem pro WhatsApp da loja. Ela precisa criar uma **lista de transmissão** e ir adicionando quem pedir.

## Planilha, contador e app

- **Planilha da Elizabeth:** ela segue `planilha/` (importa `planilha/modelo.csv` no Google Planilhas e publica como CSV) e manda o link. Cole o link em `PLANILHA`, no topo de `planilha.js`. A partir daí o catálogo vem da planilha; o `script.js` fica só de reserva.
- **Contador de visitas:** criar a conta grátis no GoatCounter, ligar "Allow adding visitor counts" e pôr o código em `CODIGO`, no topo de `contador.js`. Os números aparecem em `painel/`.
- **App:** já funciona (manifest e ícones em `app/`). No Android aparece "📲 Instalar o app da Eclipse" no rodapé; no iPhone, a dica de "Adicionar à Tela de Início".
- **Halloween:** liga sozinho de 1º a 31 de outubro (prévia em outra época: `?festa=halloween`; desligar: `?festa=nao`).


## Ferramentas novas (out/2026)

- **Checklist pra Elizabeth:** `lancamento/` mostra o que falta pra abrir, com barra de progresso e o botão "Mandei pro Samuel".
  Quando você receber e colocar no site, mude o item pra `true` em `FEITO`, no começo do script da página.
- **Cadastro rápido de peça:** `cadastro/`. Ela tira a foto e preenche, e chega no seu WhatsApp:
  - as fotos, já com o nome certo (`fotos/<id>-1.jpg`): salve em `fotos/`;
  - a linha pronta da planilha (mesmas colunas do `planilha/modelo.csv`).
- **Drop com data:** `LOJA.drop.data` no `script.js` (ex.: `"2026-10-31T19:00"`). Vazio = desligado.
  - As peças do drop levam `drop: true` (ou a coluna `drop` da planilha) e ficam escondidas até a hora.
  - Antes da hora, a faixa do topo conta o tempo e tem o botão "me avisa".
  - Na hora marcada, as peças aparecem como novidade e a faixa fica 7 dias dizendo "chegou".
- **Esgotada:** `esgotada: true` (ou a coluna `esgotada` da planilha) é peça que pode voltar: mostra "esgotada" e o botão "Me avisa quando voltar".
  Peça única vendida continua com `vendida: true` ("já tem dona").
- **Etiquetas com QR:** abra a loja com `?etiquetas` e imprima.
  - O QR abre a peça na loja e marca a origem "etiqueta" no pedido.
  - Também existe a origem `?de=google`, a do feed.
- **Carrossel das peças novas:** `NODE_PATH=$(npm root -g) node ferramentas/gerar-carrossel-eclipse.js` grava em `kit/drop/`.
  - Só peças com foto.
  - Não roda com `demo: true`.
  - Pra ver o visual sem gravar no site: `--teste <pasta>`.
- **Google Shopping (grátis):** `node ferramentas/gerar-feed-eclipse.js` grava `produtos.xml`.
  - Não roda com `demo: true`, pra peça de exemplo não ir pro Google.
  - A Elizabeth cadastra o link do `produtos.xml` no Google Merchant Center.
- **"Mostra o seu look":** botão no "Um lugar pra ser livre". Pede a foto e a autorização pra postar no "Quem já é da coven" (`DEPOIMENTOS`).
