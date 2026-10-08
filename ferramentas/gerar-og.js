#!/usr/bin/env node
/* Gera a imagem de prévia (a que aparece quando alguém manda o link no WhatsApp, Instagram ou Facebook)
   de cada página: um quadro de gibi 1200x630 com o assunto da página. Sai em imagem/og/<pagina>.jpg.
   Precisa do Playwright (só pra rodar aqui, não vai pro site):
       NODE_PATH=$(npm root -g) node ferramentas/gerar-og.js
   Mudou um título ou um preço no servicos.js? Rode de novo. */
"use strict";
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const RAIZ = path.join(__dirname, "..");
const S = require(path.join(RAIZ, "servicos.js"));
const R = S.reais, P = S.PACOTES;

const PASTAS_RAMO = { pizzaria: "site-para-pizzaria", barbearia: "site-para-barbearia", loja: "site-para-loja-de-roupa", salao: "site-para-salao-de-beleza", academia: "site-para-academia", clinica: "site-para-clinica" };

/* arquivo, selo amarelo, título (com *destaque* em vermelho), linha de baixo */
const PAGINAS = [
    ["criacao-de-sites-campo-grande", "Feito aqui em Campo Grande", "Criação de sites em *Campo Grande - MS*", `A partir de ${R(P.site.preco)} · só paga se gostar da prévia`],
    ["dicas", "Dicas grátis", "Dicas pra *vender mais*", "Google Maps, cardápio, avaliações e preço de site"],
    ["dicas-aparecer-no-google-maps", "Dica grátis", "Como aparecer no *Google Maps* de graça", "Passo a passo em 8 etapas"],
    ["dicas-cardapio-instagram-ou-site", "Dica grátis", "Cardápio no Instagram ou num *site*?", "Qual vende mais, lado a lado"],
    ["dicas-quanto-custa-um-site", "Dica grátis", "Quanto custa *um site* em 2026", `De ${R(P.site.preco)} à loja online: o que entra no preço`],
    ["dicas-catalogo-whatsapp-ou-site", "Dica grátis", "Catálogo do WhatsApp ou *site*?", "Quando o catálogo basta e quando vale um site"],
    ["dicas-avaliacoes-no-google", "Dica grátis", "Mais *avaliações* no Google", "Sem comprar nenhuma: mensagem pronta e o que nunca fazer"],
    ["dicas-site-ou-ifood", "Dica grátis", "Site próprio ou *iFood*?", "Onde a pizzaria lucra mais"],
    ["qr", "Ferramenta grátis", "QR Code do seu *WhatsApp*", "Pronto pra imprimir e colar no balcão"],
    ["teste", "Teste de 1 minuto", "Seu negócio tá pronto pra *vender online*?", "Nota de 0 a 10 e 3 dicas no final"],
    ["monte", "Preço na hora", "Monte seu site e veja *o preço*", `Pacotes a partir de ${R(P.site.preco)}, pagamento único`],
    ["como-trabalho", "Sem surpresa", "Como eu *trabalho*", "Só paga se gostar da prévia · tudo por escrito"],
    ["como-foi-feito", "Bastidores", "Como este site *foi feito*", "Música no navegador, gibi leve e testes automáticos"],
    ...Object.entries(PASTAS_RAMO).map(([k, pasta]) => {
        const r = S.RAMOS[k], p = P[r.pacote];
        return [pasta, "Site pro seu ramo", `Site para *${r.titulo}*`, `${p.nome} · a partir de ${R(p.preco)}`];
    }),
];

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const foto = "data:image/webp;base64," + fs.readFileSync(path.join(RAIZ, "imagem/samuel-rosto-hq-168.webp")).toString("base64");

function html([, selo, titulo, linha]) {
    const t = esc(titulo).replace(/\*(.+?)\*/g, "<em>$1</em>");
    return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bangers&family=DM+Mono:wght@500&family=Space+Grotesk:wght@600;700&display=block">
<style>
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; background: #161616; font-family: "Space Grotesk", sans-serif; }
.quadro { position: absolute; inset: 26px; border: 6px solid #111111; border-radius: 10px; overflow: hidden;
  background: radial-gradient(circle, rgba(17,17,17,.13) 2px, transparent 2.6px) 0 0 / 16px 16px, #f3ead6; box-shadow: 0 0 0 4px #f2f2f2; }
.explosao { position: absolute; right: -60px; top: -70px; width: 420px; height: 420px; background: #ff2a3d;
  clip-path: polygon(50% 0%, 61% 17%, 79% 7%, 80% 27%, 100% 26%, 90% 43%, 100% 58%, 82% 65%, 87% 86%, 67% 82%, 57% 100%, 45% 84%, 25% 94%, 22% 74%, 2% 72%, 12% 55%, 0% 39%, 18% 32%, 15% 12%, 36% 17%); opacity: .95; }
.selo { position: absolute; left: 56px; top: 50px; padding: 10px 20px 6px; border: 4px solid #111111; background: #ffe14d; color: #111111;
  font: 400 34px/1 "Bangers"; letter-spacing: .06em; text-transform: uppercase; box-shadow: 6px 6px 0 #111111; transform: rotate(-2deg); }
h1 { position: absolute; left: 56px; right: 300px; top: 150px; color: #111111; font: 400 92px/.95 "Bangers"; letter-spacing: .02em; text-transform: uppercase; }
h1 em { color: #e01e2f; font-style: normal; -webkit-text-stroke: 2px #111111; paint-order: stroke fill; text-shadow: 5px 5px 0 #111111; }
.linha { position: absolute; left: 56px; right: 300px; bottom: 104px; color: #2b2b2b; font: 700 30px/1.25 "Space Grotesk"; }
.rodape { position: absolute; left: 0; right: 0; bottom: 0; height: 74px; display: flex; align-items: center; gap: 16px; padding: 0 30px 0 56px; background: #111111; color: #f3ead6; font: 500 21px "DM Mono"; white-space: nowrap; }
.rodape b { color: #ffe14d; font: 400 32px/1 "Bangers"; letter-spacing: .05em; }
.rodape span { margin-left: auto; color: #ff8a95; }
.avatar { position: absolute; right: 56px; bottom: 110px; width: 210px; height: 210px; border: 6px solid #111111; border-radius: 50%; background: #ffffff url(${foto}) center / cover; box-shadow: 8px 8px 0 #111111; }
.balao { position: absolute; right: 70px; top: 96px; padding: 12px 18px 8px; border: 4px solid #111111; border-radius: 22px; background: #ffffff; color: #111111; font: 400 30px/1 "Bangers"; letter-spacing: .04em; transform: rotate(3deg); }
.balao::after { content: ""; position: absolute; left: 50%; bottom: -22px; border: 12px solid transparent; border-top: 18px solid #111111; }
</style></head><body><div class="quadro">
<div class="explosao"></div>
<p class="selo">${esc(selo)}</p>
<h1>${t}</h1>
<p class="linha">${esc(linha)}</p>
<div class="balao">Bora?</div>
<div class="avatar"></div>
<div class="rodape"><b>Samuel Mickael</b> dev web · Campo Grande - MS <span>samueldevmi.github.io/portfolio</span></div>
</div></body></html>`;
}

(async () => {
    const destino = path.join(RAIZ, "imagem", "og");
    fs.mkdirSync(destino, { recursive: true });
    const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium", args: ["--ignore-certificate-errors"] });
    const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
    for (const item of PAGINAS) {
        await pagina.setContent(html(item), { waitUntil: "networkidle" });
        await pagina.evaluate(() => document.fonts.ready);
        // título comprido: diminui a fonte até caber acima da linha de baixo
        await pagina.evaluate(() => {
            const h = document.querySelector("h1"), limite = document.querySelector(".linha").getBoundingClientRect().top - 24;
            let tamanho = 92;
            while (h.getBoundingClientRect().bottom > limite && tamanho > 48) { tamanho -= 4; h.style.fontSize = tamanho + "px"; }
        });
        await pagina.screenshot({ path: path.join(destino, item[0] + ".jpg"), type: "jpeg", quality: 82 });
        console.log("gerada: imagem/og/" + item[0] + ".jpg");
    }
    await navegador.close();
})();
