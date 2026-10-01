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
