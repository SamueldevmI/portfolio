#!/usr/bin/env node
/* Gera os carrosséis do Instagram (1080x1350, estilo gibi) de cada dica, mais a legenda pronta pra copiar.
   Sai em instagram/<dica>/01.jpg, 02.jpg… e instagram/<dica>/legenda.txt, e a página instagram/index.html
   (escondida do Google) junta tudo pra baixar pelo celular.
       NODE_PATH=$(npm root -g) node ferramentas/gerar-carrosseis.js
   O texto de cada slide resume o artigo da dica (ferramentas/gerar-paginas-conteudo.js): mudou lá, ajuste aqui. */
"use strict";
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const RAIZ = path.join(__dirname, "..");
const S = require(path.join(RAIZ, "servicos.js"));
const R = S.reais, P = S.PACOTES;
const LINK = "samueldevmi.github.io/portfolio/dicas";

const DICAS = [
    { pasta: "aparecer-no-google-maps", titulo: "Como aparecer no *Google Maps* de graça", slides: [
        ["texto", "Por que importa", "Quando alguém procura “pizzaria perto de mim”, o Google mostra primeiro um mapa com os negócios da região. Pra aparecer ali você *não paga nada*."],
        ["lista", "Passo a passo (1 a 4)", ["Entre em google.com/business com seu Gmail", "Digite o nome do seu negócio", "Escolha a categoria mais específica (“Pizzaria”, não “Restaurante”)", "Informe o endereço, ou só a área que você atende"]],
        ["lista", "Passo a passo (5 a 8)", ["Coloque telefone, WhatsApp e site", "Confirme que o negócio é seu (o Google pede uma verificação)", "Preencha horário e fotos", "Peça avaliações pros clientes satisfeitos"]],
        ["texto", "Não faça isso", "Encher o nome de palavras: “Pizzaria do João Melhor Pizza Barata”. Vai contra as regras do Google e pode *derrubar o perfil*. Use o nome da fachada."],
    ], legenda: "Aparecer no Google Maps é de graça, e é o primeiro lugar onde o cliente da sua região procura. Salva esse passo a passo 📌" },
    { pasta: "cardapio-instagram-ou-site", titulo: "Cardápio no Instagram ou num *site*?", slides: [
        ["texto", "A verdade", "O Instagram é *ótimo pra ser descoberto*. E péssimo pra fazer pedido."],
        ["compara", "Lado a lado", ["Só Instagram", "Site com cardápio"], [["Ver o preço", "Foto que fica velha", "Sempre atualizado"], ["Fazer o pedido", "Direct, espera, pergunta de novo", "Pedido pronto no WhatsApp"], ["Pedido errado", "Comum", "Raro"], ["Taxa por pedido", "Nenhuma", "Nenhuma"]]],
        ["texto", "Então qual escolher?", "*Os dois.* O Instagram atrai, o site fecha. Link do cardápio na bio e nos stories, e o cliente pede sozinho."],
    ], legenda: "Cardápio só no destaque do Instagram dá trabalho e perde pedido. O jeito que funciona é usar os dois juntos 👇" },
    { pasta: "quanto-custa-um-site", titulo: "Quanto custa *um site* em 2026", slides: [
        ["texto", "Depende…", "“Quanto custa um site?” é igual a “quanto custa uma reforma”: depende do que vai ter dentro. Mas dá pra ter *uma ideia bem concreta*."],
        ["lista", "Meus preços em Campo Grande", Object.values(P).map((p) => `${p.curto}: a partir de ${R(p.preco)}`)],
        ["lista", "O que faz o preço mudar", ["Quantidade de coisas pra mostrar", "O que o site faz sozinho (pedido, agenda, frete)", "Se você já tem fotos e textos"]],
        ["texto", "Sem susto", `Pagamento único, sem mensalidade. E *só paga se gostar da prévia*: ${S.GARANTIA.pagamento.toLowerCase()}.`],
    ], legenda: "Quanto custa um site pro seu negócio? Os preços de verdade, sem enrolação 💸" },
    { pasta: "catalogo-whatsapp-ou-site", titulo: "Catálogo do WhatsApp ou *site*?", slides: [
        ["texto", "Começa pelo grátis", "O WhatsApp Business tem *catálogo grátis*: produto, foto e preço dentro da conversa. Pra muito negócio já é um ótimo começo."],
        ["lista", "Quando o catálogo basta", ["Você tem poucos produtos", "Quase todo cliente já chega pelo WhatsApp", "Você está começando e quer testar"]],
        ["lista", "Quando vale um site", ["Quer ser achado por gente nova no Google", "Tem muita variação: tamanho, cor, sabor", "Quer um link com a cara do seu negócio"]],
        ["texto", "Dá pra usar os dois", "O site atrai e organiza. O pedido chega *no mesmo WhatsApp de sempre*, sem taxa por pedido."],
    ], legenda: "O catálogo do WhatsApp Business é grátis. Quando ele basta e quando vale ter um site? 🤔" },
    { pasta: "avaliacoes-no-google", titulo: "Mais *avaliações* no Google", slides: [
        ["texto", "Em qual você pede?", "Duas pizzarias lado a lado no mapa: uma com 4 avaliações, outra com 180. Avaliação é a *prova* de que outras pessoas confiaram em você."],
        ["lista", "Como pedir", ["Pegue o link de avaliação no seu Perfil da Empresa", "Peça logo depois de um atendimento que deu certo", "Mande pelo WhatsApp, já com o link", "Deixe um QR Code no balcão", "Responda todas, as boas e as ruins"]],
        ["texto", "Mensagem pronta", "“Oi, [nome]! Que bom que você gostou 😊 Se puder, deixa uma avaliação pra gente no Google? Ajuda muito um negócio pequeno como o nosso: [link]”"],
        ["lista", "Nunca faça", ["Comprar avaliação", "Dar desconto em troca de avaliação", "Brigar na resposta"]],
    ], legenda: "Avaliação no Google é o que faz o cliente escolher você no mapa. Como conseguir mais, sem comprar nenhuma ⭐" },
    { pasta: "site-ou-ifood", titulo: "Site próprio ou *iFood*?", slides: [
        ["texto", "Não são inimigos", "App de delivery e site próprio fazem *trabalhos diferentes*. O erro é deixar todo pedido passar pelo app, até o do cliente que já te conhece."],
        ["compara", "Lado a lado", ["App de delivery", "Site próprio"], [["Cliente novo", "Ótimo", "Depende de divulgar"], ["Custo por pedido", "Comissão", "Nenhum"], ["Contato do cliente", "Fica com o app", "Fica com você"]]],
        ["texto", "Faça a conta", "Pegue os pedidos do mês no app e a comissão do último extrato. Esse valor saiu do seu bolso pra vender pra quem, muitas vezes, *já era seu cliente*."],
        ["lista", "O jeito que funciona", ["No app: ser descoberto", "No seu link: quem já é cliente pede direto", "Dê um motivo: preço de balcão ou um brinde"]],
    ], legenda: "Site próprio ou iFood: onde a pizzaria lucra mais? Spoiler: usando os dois do jeito certo 🍕" },
    { pasta: "link-na-bio", titulo: "O que colocar no *link da bio*", slides: [
        ["texto", "A porta da loja", "Quase todo cliente que te acha no Instagram passa pelo link da bio. Se ali tiver *bagunça*, ele vai pro próximo perfil."],
        ["lista", "O que o cliente procura", ["Como pedir ou agendar", "O preço", "Onde fica e o horário", "Seu WhatsApp"]],
        ["texto", "Menos é mais", "Cada botão a mais é uma decisão a mais. Coloque *o que vende em primeiro* e no máximo 3 ou 4 opções."],
        ["texto", "Teste no seu celular", "Com o 4G: abriu rápido e deu pra pedir em poucos toques? *Então tá bom.* PDF pesado e página cheia de botões espantam cliente."],
    ], legenda: "O link da bio é a porta da sua loja no Instagram. O que colocar (e o que tirar) pra ele vender 👆" },
    { pasta: "cardapio-digital-gratis", titulo: "Cardápio digital *grátis*: dá certo?", slides: [
        ["texto", "Dá pra começar sem gastar", "E muita gente deveria começar assim. Mas *cada opção grátis tem um limite*."],
        ["compara", "Onde cada uma trava", ["Bom pra", "Trava em"], [["Foto no destaque", "Começar hoje", "Preço desatualiza"], ["PDF na bio", "Cardápio grande", "Pesado no celular"], ["Catálogo do WhatsApp", "Quem já vende lá", "Não aparece no Google"]]],
        ["lista", "Hora do próximo passo", ["Responde o mesmo preço várias vezes por dia", "Pedido chega errado, anotado na mão", "Quer aparecer no Google na sua região"]],
    ], legenda: "Cardápio digital grátis dá certo? Pra começar, sim. Mas cada opção tem um limite: veja qual 📋" },
    { pasta: "responder-no-whatsapp", titulo: "Responder no *WhatsApp* sem perder venda", slides: [
        ["texto", "Quem responde primeiro leva", "Quem manda mensagem pra um negócio geralmente mandou pra outros dois. *Quem responde primeiro, e direito, leva o pedido.*"],
        ["lista", "Grátis no WhatsApp Business", ["Mensagem de saudação com o link do cardápio", "Mensagem de ausência com o horário", "Respostas rápidas pra preço e entrega", "Etiquetas: novo, pago, entregue"]],
        ["lista", "Como responder pra fechar", ["Responda o que ele perguntou, com preço", "Uma pergunta por vez", "Termine com o próximo passo"]],
        ["texto", "Mensagem de ausência", "“Agora estamos fechados, mas voltamos amanhã às 18h 😊 Já dá pra ver o cardápio e *deixar o pedido pronto* aqui: [link]”"],
    ], legenda: "Cliente que espera, desiste. Os recursos grátis do WhatsApp Business que respondem por você 💬" },
];

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const destaque = (t) => esc(t).replace(/\*(.+?)\*/g, "<em>$1</em>");
const foto = "data:image/webp;base64," + fs.readFileSync(path.join(RAIZ, "imagem/samuel-rosto-hq-168.webp")).toString("base64");

function slideHtml(dica, slide, n, total) {
    const [tipo] = slide;
    let miolo = "";
    if (tipo === "capa") miolo = `<p class="selo">Dica grátis</p><h1>${destaque(dica.titulo)}</h1><p class="arraste">arrasta pro lado ➜</p><div class="avatar"></div>`;
    else if (tipo === "texto") miolo = `<h2>${esc(slide[1])}</h2><p class="texto">${destaque(slide[2])}</p>`;
    else if (tipo === "lista") miolo = `<h2>${esc(slide[1])}</h2><ol class="lista">${slide[2].map((i) => `<li>${esc(i)}</li>`).join("")}</ol>`;
    else if (tipo === "compara") miolo = `<h2>${esc(slide[1])}</h2><table><tr><th></th><th>${esc(slide[2][0])}</th><th class="bom">${esc(slide[2][1])}</th></tr>${slide[3].map(([r, a, b]) => `<tr><th>${esc(r)}</th><td>${esc(a)}</td><td class="bom">${esc(b)}</td></tr>`).join("")}</table>`;
    else miolo = `<p class="selo">Gostou?</p><h1>Passo a passo <em>completo</em> no link da bio</h1><p class="texto">Salva esse post e manda pra quem tem negócio 🙌</p><p class="link">${LINK}</p><div class="avatar"></div>`;
    return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bangers&family=DM+Mono:wght@500&family=Space+Grotesk:wght@500;700&display=block">
<style>
* { box-sizing: border-box; margin: 0; }
body { width: 1080px; height: 1350px; overflow: hidden; background: #161616; font-family: "Space Grotesk", sans-serif; }
.quadro { position: absolute; inset: 34px; border: 8px solid #111111; border-radius: 12px; overflow: hidden; padding: 90px 72px 150px;
  background: radial-gradient(circle, rgba(17,17,17,.12) 2.4px, transparent 3px) 0 0 / 20px 20px, #f3ead6; box-shadow: 0 0 0 5px #f2f2f2; }
.explosao { position: absolute; right: -120px; top: -120px; width: 420px; height: 420px; background: #ff2a3d; opacity: .92;
  clip-path: polygon(50% 0%, 61% 17%, 79% 7%, 80% 27%, 100% 26%, 90% 43%, 100% 58%, 82% 65%, 87% 86%, 67% 82%, 57% 100%, 45% 84%, 25% 94%, 22% 74%, 2% 72%, 12% 55%, 0% 39%, 18% 32%, 15% 12%, 36% 17%); }
.num { position: absolute; right: 50px; top: 46px; color: #ffffff; font: 400 54px/1 "Bangers"; letter-spacing: .04em; -webkit-text-stroke: 3px #111111; paint-order: stroke fill; }
.selo { display: inline-block; margin-bottom: 40px; padding: 12px 24px 8px; border: 5px solid #111111; background: #ffe14d; color: #111111; font: 400 46px/1 "Bangers"; letter-spacing: .06em; text-transform: uppercase; box-shadow: 8px 8px 0 #111111; transform: rotate(-2deg); }
h1 { max-width: 780px; color: #111111; font: 400 150px/.95 "Bangers"; letter-spacing: .02em; text-transform: uppercase; }
h2 { margin: 30px 0 46px; color: #111111; font: 400 92px/1 "Bangers"; letter-spacing: .03em; text-transform: uppercase; }
h1 em, h2 em, .texto em { color: #e01e2f; font-style: normal; }
h1 em { -webkit-text-stroke: 3px #111111; paint-order: stroke fill; text-shadow: 7px 7px 0 #111111; }
.texto { color: #222222; font: 700 54px/1.32 "Space Grotesk"; }
.sub { max-width: 600px; margin-top: 44px; font-size: 44px; color: #333333; }
.texto em { background: #ffe14d; padding: 0 8px; color: #111111; }
.lista { margin: 0; padding: 0; list-style: none; counter-reset: n; }
.lista li { position: relative; margin-bottom: 34px; padding-left: 96px; color: #222222; font: 700 46px/1.25 "Space Grotesk"; }
.lista li::before { counter-increment: n; content: counter(n); position: absolute; left: 0; top: -4px; width: 68px; height: 68px; display: grid; place-items: center; border: 5px solid #111111; border-radius: 50%; background: #ffe14d; color: #111111; font: 400 46px/1 "Bangers"; box-shadow: 4px 4px 0 #111111; }
table { width: 100%; border-collapse: collapse; font-size: 38px; }
th, td { padding: 22px 12px; border-bottom: 4px solid #111111; text-align: left; vertical-align: top; color: #222222; }
tr:first-child th { font: 400 48px/1 "Bangers"; letter-spacing: .03em; color: #111111; }
th { font-weight: 700; }
.bom { color: #b0162a; font-weight: 700; }
.arraste { position: absolute; left: 72px; bottom: 190px; color: #111111; font: 400 56px/1 "Bangers"; letter-spacing: .05em; }
.link { margin-top: 40px; color: #b0162a; font: 500 38px "DM Mono"; }
.avatar { position: absolute; right: 64px; bottom: 170px; width: 260px; height: 260px; border: 7px solid #111111; border-radius: 50%; background: #ffffff url(${foto}) center / cover; box-shadow: 10px 10px 0 #111111; }
.rodape { position: absolute; left: 0; right: 0; bottom: 0; height: 100px; display: flex; align-items: center; gap: 18px; padding: 0 44px; background: #111111; color: #f3ead6; font: 500 30px "DM Mono"; white-space: nowrap; }
.rodape b { color: #ffe14d; font: 400 44px/1 "Bangers"; letter-spacing: .05em; }
</style></head><body><div class="quadro">
${tipo === "capa" || tipo === "cta" ? '<div class="explosao"></div>' : ""}
<p class="num">${n}/${total}</p>
${miolo}
<div class="rodape"><b>Samuel Mickael</b> dev web · Campo Grande - MS</div>
</div></body></html>`;
}

(async () => {
    const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium", args: ["--ignore-certificate-errors"] });
    const pagina = await navegador.newPage({ viewport: { width: 1080, height: 1350 } });
    const lista = [];
    for (const dica of DICAS) {
        const pasta = path.join(RAIZ, "instagram", dica.pasta);
        fs.rmSync(pasta, { recursive: true, force: true });
        fs.mkdirSync(pasta, { recursive: true });
        const slides = [["capa"], ...dica.slides, ["cta"]];
        const arquivos = [];
        for (let i = 0; i < slides.length; i++) {
            await pagina.setContent(slideHtml(dica, slides[i], i + 1, slides.length), { waitUntil: "networkidle" });
            await pagina.evaluate(() => document.fonts.ready);
            // texto comprido: diminui até caber acima do rodapé
            await pagina.evaluate(() => {
                const limite = document.querySelector(".rodape").getBoundingClientRect().top - 30;
                const alvos = [...document.querySelectorAll(".texto, .lista li, td, th, h1, h2")];
                let escala = 1;
                const fundo = () => Math.max(...[...document.querySelectorAll(".quadro > *:not(.rodape):not(.explosao):not(.num):not(.avatar):not(.arraste)")].map((e) => e.getBoundingClientRect().bottom));
                const base = alvos.map((e) => parseFloat(getComputedStyle(e).fontSize));
                while (fundo() > limite && escala > .55) { escala -= .05; alvos.forEach((e, i) => { e.style.fontSize = base[i] * escala + "px"; }); }
            });
            const nome = String(i + 1).padStart(2, "0") + ".jpg";
            await pagina.screenshot({ path: path.join(pasta, nome), type: "jpeg", quality: 85 });
            arquivos.push(nome);
        }
        const legenda = `${dica.legenda}\n\nPasso a passo completo no link da bio: ${S.SITE}dicas/${dica.pasta}/\n\n#CampoGrande #CampoGrandeMS #PequenosNegocios #Empreendedorismo #DicasDeNegocio`;
        fs.writeFileSync(path.join(pasta, "legenda.txt"), legenda + "\n");
        lista.push({ dica, arquivos, legenda });
        console.log("gerado: instagram/" + dica.pasta + " (" + arquivos.length + " slides)");
    }
    await navegador.close();
    // página pra baixar pelo celular (escondida do Google)
    const html = `<!doctype html>
<!-- Gerado por ferramentas/gerar-carrosseis.js: não edite à mão. -->
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow"><title>Carrosséis do Instagram | Samuel</title>
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<style>
body { margin: 0; padding: 20px 16px 60px; background: #161616; color: #f2f2f2; font: 16px/1.5 system-ui, sans-serif; }
main { max-width: 900px; margin: auto; } h1 { font-size: 1.6rem; } h2 { margin: 36px 0 10px; font-size: 1.2rem; }
.slides { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 8px; scroll-snap-type: x mandatory; }
.slides a { flex: 0 0 160px; scroll-snap-align: start; } .slides img { width: 160px; height: 200px; object-fit: cover; border-radius: 6px; display: block; }
textarea { width: 100%; min-height: 120px; margin-top: 8px; border-radius: 8px; padding: 10px; font: inherit; box-sizing: border-box; }
button { margin-top: 6px; padding: 8px 14px; border: 0; border-radius: 6px; background: #ffe14d; font-weight: 700; cursor: pointer; }
p.dica { color: #bbbbbb; }
</style></head><body><main>
<h1>Carrosséis do Instagram</h1>
<p class="dica">Toque num slide pra abrir e segure pra salvar no celular. Poste na ordem (01, 02…) e cole a legenda.</p>
${lista.map(({ dica, arquivos, legenda }) => `<section><h2>${esc(dica.titulo.replace(/\*/g, ""))}</h2>
<div class="slides">${arquivos.map((a) => `<a href="${dica.pasta}/${a}" download><img src="${dica.pasta}/${a}" alt="slide ${a}" loading="lazy"></a>`).join("")}</div>
<textarea readonly>${esc(legenda)}</textarea><button type="button" onclick="navigator.clipboard.writeText(this.previousElementSibling.value);this.textContent='Copiado!'">Copiar legenda</button></section>`).join("\n")}
</main></body></html>
`;
    fs.writeFileSync(path.join(RAIZ, "instagram", "index.html"), html);
    console.log("gerada: instagram/index.html");
})();
