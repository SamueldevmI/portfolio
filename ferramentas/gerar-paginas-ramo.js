#!/usr/bin/env node
/* Gera uma página por ramo pra aparecer no Google ("site para barbearia em Campo Grande"):
   site-para-<ramo>/index.html, com o conteúdo do servicos.js e o celular da previa-celular.js já no HTML.
   Rode depois de mudar preço, pacote ou texto de ramo no servicos.js:
       node ferramentas/gerar-paginas-ramo.js            (gera)
       node ferramentas/gerar-paginas-ramo.js --conferir (só confere se está em dia; usado no CI) */
"use strict";
const fs = require("fs");
const path = require("path");
const RAIZ = path.join(__dirname, "..");
const S = require(path.join(RAIZ, "servicos.js"));
const P = require(path.join(RAIZ, "previa-celular.js"));
const esc = P.esc;
const VERSAO = "20261002";

const PASTAS = { pizzaria: "site-para-pizzaria", barbearia: "site-para-barbearia", loja: "site-para-loja-de-roupa", salao: "site-para-salao-de-beleza", academia: "site-para-academia", clinica: "site-para-clinica" };

const CSS = `
        .rp { width: min(1080px, calc(100% - 32px)); margin: 24px auto 90px; }
        .rp .eyebrow::before { content: none; }
        .rp-voltar { display: inline-block; margin-bottom: 18px; color: var(--muted); font-size: .9rem; text-decoration: none; }
        .rp h1 { margin: 8px 0 12px; max-width: 18ch; font-size: clamp(2.1rem, 6.4vw, 3.6rem); line-height: 1.04; letter-spacing: -.04em; }
        .rp h1 em { color: var(--cyan); font-style: normal; }
        .rp h2 { margin: 0 0 14px; font-size: clamp(1.5rem, 4vw, 2.1rem); letter-spacing: -.03em; }
        .rp p { color: var(--muted); line-height: 1.6; }
        .rp-lead { max-width: 56ch; font-size: 1.1rem; }
        .rp-acoes { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
        .rp-acoes .botao { cursor: var(--cursor-mao); }
        .rp-bloco { margin-top: 64px; }
        .rp-dois { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 32px; align-items: center; }
        .rp-chat { display: grid; gap: 8px; max-width: 420px; }
        .rp-msg { justify-self: start; max-width: 85%; margin: 0; padding: 10px 14px; border-radius: 16px 16px 16px 4px; background: var(--surface-2); color: var(--text); }
        .rp-msg:nth-child(even) { justify-self: end; border-radius: 16px 16px 4px 16px; }
        .rp-alerta { margin: 4px 0 0; padding: 10px 14px; border: 1px dashed rgba(var(--cyan-rgb), .6); border-radius: 12px; color: var(--text) !important; font-weight: 600; }
        .rp-lista { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
        .rp-lista li { position: relative; padding-left: 28px; color: var(--text); font-size: 1.05rem; line-height: 1.45; }
        .rp-lista li::before { content: "✓"; position: absolute; left: 0; color: var(--sucesso); font-weight: 700; }
        .rp-celular { display: grid; justify-items: center; }
        .rp-celular .previa-celular { animation: none; }
        .rp-preco { display: grid; gap: 10px; max-width: 520px; padding: 24px; border: 1px solid rgba(var(--cyan-rgb), .55); border-radius: 20px; background: linear-gradient(160deg, rgba(var(--cyan-rgb), .12), transparent 55%), var(--surface); }
        .rp-preco strong { color: var(--ouro); font-size: clamp(2.2rem, 7vw, 3rem); letter-spacing: -.04em; line-height: 1; }
        .rp-preco ul { display: grid; gap: 6px; margin: 4px 0 0; padding: 0; list-style: none; }
        .rp-preco li { color: var(--muted); }
        .rp-preco li::before { content: "✓ "; color: var(--sucesso); }
        .rp-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .rp-tags span { padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,.07); color: var(--text); font-size: .82rem; font-weight: 600; }
        .rp-garantia { max-width: 560px; margin: 14px 0 0; padding: 12px 14px; border: 1px solid rgba(var(--sucesso-rgb), .45); border-radius: 14px; background: rgba(var(--sucesso-rgb), .08); }
        .rp-garantia b { color: var(--sucesso); }
        .rp-faq details { padding: 14px 0; border-bottom: 1px solid var(--line); }
        .rp-faq summary { color: var(--text); font-weight: 600; cursor: var(--cursor-mao); }
        .rp-faq p { margin: 8px 0 0; }
        .rp-fim { margin-top: 64px; padding: 28px; border: 1px solid rgba(var(--cyan-rgb), .5); border-radius: 18px; background: var(--surface); text-align: center; }
        .rp-fim p { max-width: 52ch; margin: 0 auto; }
        .rp-fim .rp-acoes { justify-content: center; }
        .rp-outros { margin-top: 40px; font-size: .92rem; }
        .rp-outros a { color: var(--acento-texto); }
        @media (max-width: 820px) { .rp-dois { grid-template-columns: 1fr; } }`;

function pagina(k) {
    const r = S.RAMOS[k], p = S.PACOTES[r.pacote], pasta = PASTAS[k];
    const sua = r.masc ? "seu" : "sua", toda = r.masc ? "todo" : "toda";
    const url = `${S.SITE}${pasta}/`;
    const titulo = `Site para ${r.titulo} em Campo Grande - MS`;
    const descricao = `Site pra ${r.nome} com ${p.curto.toLowerCase() === "site" ? "botão pro WhatsApp" : p.curto.toLowerCase() + " pelo WhatsApp"}, feito em Campo Grande - MS. A partir de ${S.reais(p.preco)}, sem mensalidade. Chega de ${r.dor}.`;
    const whats = `https://wa.me/${S.WHATS}?text=${encodeURIComponent(`Oi, Samuel! Vi a página de site para ${r.nome} e quero um pro meu negócio.`)}`;
    const ld = [
        { "@context": "https://schema.org", "@type": "Service", name: titulo, serviceType: "Criação de site", provider: { "@type": "Person", name: "Samuel Mickael", url: S.SITE }, areaServed: { "@type": "City", name: "Campo Grande" },
          offers: { "@type": "Offer", price: String(p.preco), priceCurrency: "BRL", description: p.nome }, url },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: r.faq.map(([pergunta, resposta]) => ({ "@type": "Question", name: pergunta, acceptedAnswer: { "@type": "Answer", text: resposta } })) },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Samuel Mickael", item: S.SITE }, { "@type": "ListItem", position: 2, name: titulo, item: url }] },
    ];
    const outros = Object.keys(S.RAMOS).filter((x) => x !== k).map((x) => `<a href="../${PASTAS[x]}/">${esc(S.RAMOS[x].titulo)}</a>`).join(" · ");
    return `<!doctype html>
<!-- Gerado por ferramentas/gerar-paginas-ramo.js a partir do servicos.js: não edite à mão. -->
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(titulo)} | Samuel Mickael</title>
    <meta name="description" content="${esc(descricao)}">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${esc(titulo)}">
    <meta property="og:description" content="${esc(descricao)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${S.SITE}imagem/og-image-v5.jpg">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" href="../favicon.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap">
    <script>
        (function () {
            var azul = false;
            try { azul = localStorage.getItem("portfolio-tema") === "azul"; } catch (e) { /* sem armazenamento */ }
            document.documentElement.dataset.tema = azul ? "azul" : "vermelho";
            document.write('<link rel="stylesheet" href="../' + (azul ? "style-azul.css" : "style.css") + '?v=${VERSAO}">');
        })();
    </script>
    <noscript><link rel="stylesheet" href="../style.css"></noscript>
${ld.map((x) => `    <script type="application/ld+json">${JSON.stringify(x)}</script>`).join("\n")}
    <style>${CSS}
    </style>
</head>
<body>
    <main class="rp">
        <a class="rp-voltar" href="../">← Samuel Mickael · sites em Campo Grande</a>
        <p class="eyebrow">${esc(r.emoji)} SITE PARA ${esc(r.titulo.toUpperCase())} · CAMPO GRANDE - MS</p>
        <h1>Site pra ${esc(r.nome)}: chega de <em>${esc(r.dor)}</em></h1>
        <p class="rp-lead">${esc(p.resumo)} Funciona no celular, aparece no Google e o cliente chega no seu WhatsApp já sabendo o que quer. A partir de <b>${S.reais(p.preco)}</b>, sem mensalidade.</p>
        <div class="rp-acoes">
            <a class="botao botao-principal" href="../?ramo=${k}&amp;previa=1">Ver a prévia com o nome do meu negócio</a>
            <a class="botao botao-secundario" href="../monte.html?ramo=${k}">Montar o meu e ver o preço</a>
        </div>

        <section class="rp-bloco rp-dois" aria-labelledby="rpHoje">
            <div>
                <h2 id="rpHoje">Hoje, no WhatsApp de ${toda} ${esc(r.nome)}</h2>
                <p>Mensagens que chegam o dia todo e que um site responde sozinho:</p>
            </div>
            <div class="rp-chat">
${r.sem.map((m) => `                <p class="rp-msg">${esc(m)}</p>`).join("\n")}
                <p class="rp-alerta">${esc(r.alerta)}</p>
            </div>
        </section>

        <section class="rp-bloco rp-dois" aria-labelledby="rpCom">
            <div class="rp-celular">${P.celular(r.previa, r.exemplo)}</div>
            <div>
                <h2 id="rpCom">Com um site, fica assim</h2>
                <ul class="rp-lista">
${r.com.map((t) => `                    <li>${esc(t)}</li>`).join("\n")}
                    <li>Aparece no Google quando procuram “${esc(r.nome)} perto de mim” em Campo Grande</li>
                </ul>
                <div class="rp-acoes"><a class="botao botao-secundario" href="../?ramo=${k}&amp;previa=1">Ver com o nome do meu negócio →</a></div>
            </div>
        </section>

        <section class="rp-bloco" aria-labelledby="rpPreco">
            <h2 id="rpPreco">Quanto custa</h2>
            <div class="rp-preco">
                <span>${esc(p.nome)}</span>
                <strong>a partir de ${S.reais(p.preco)}</strong>
                <div class="rp-tags"><span>pagamento único</span><span>sem mensalidade</span><span>pronto em ~${p.prazo} dias</span><span>${esc(S.GARANTIA.pagamento)}</span></div>
                <ul>
${p.itens.map(([t, d]) => `                    <li>${esc(t)}: ${esc(d)}</li>`).join("\n")}
                </ul>
            </div>
            <p class="rp-garantia"><b>${esc(S.GARANTIA.curto)}.</b> ${esc(S.GARANTIA.texto)}</p>
            <p style="margin-top:14px">Quer ver um que já está no ar? <a href="../case-eclipse.html" style="color:var(--acento-texto)">A loja da Eclipse Studio</a>, aqui de Campo Grande.</p>
        </section>

        <section class="rp-bloco rp-faq" aria-labelledby="rpFaq">
            <h2 id="rpFaq">Perguntas de quem tem ${esc(r.nome)}</h2>
${r.faq.map(([q, a]) => `            <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n")}
            <details><summary>E se eu não gostar?</summary><p>${esc(S.GARANTIA.texto)}</p></details>
            <details><summary>Quanto tempo leva?</summary><p>Em torno de ${p.prazo} dias depois de você me mandar fotos, preços e textos. Eu te mostro uma prévia antes de colocar no ar.</p></details>
        </section>

        <section class="rp-fim" aria-labelledby="rpFim">
            <h2 id="rpFim">Bora fazer o site ${r.masc ? "do" : "da"} ${sua} ${esc(r.nome)}?</h2>
            <p>Me conta como você atende hoje que eu te mando o orçamento em até 24h, sem compromisso. Não sabe por onde começar? <a href="../teste.html" style="color:var(--acento-texto)">Faça o teste de 1 minuto</a>.</p>
            <div class="rp-acoes">
                <a class="botao botao-principal" href="${whats}" target="_blank" rel="noopener noreferrer">Pedir orçamento no WhatsApp</a>
                <a class="botao botao-secundario" href="../monte.html?ramo=${k}">Montar e ver o preço</a>
            </div>
        </section>

        <p class="rp-outros">Também faço site para: ${outros}.</p>
    </main>
    <script src="../estatisticas.js?v=${VERSAO}"></script>
    <script src="../servicos.js?v=${VERSAO}"></script>
    <script>window.ESTATISTICAS && window.ESTATISTICAS.contar("/${pasta}/", "${esc(titulo)}", true);</script>
</body>
</html>
`;
}

const conferir = process.argv.includes("--conferir");
let desatualizado = [];
for (const k of Object.keys(PASTAS)) {
    const arquivo = path.join(RAIZ, PASTAS[k], "index.html");
    const html = pagina(k);
    if (conferir) {
        if (!fs.existsSync(arquivo) || fs.readFileSync(arquivo, "utf8") !== html) desatualizado.push(PASTAS[k]);
    } else {
        fs.mkdirSync(path.dirname(arquivo), { recursive: true });
        fs.writeFileSync(arquivo, html);
    }
}
if (conferir) {
    if (desatualizado.length) { console.error(`Páginas por ramo desatualizadas (${desatualizado.join(", ")}): rode node ferramentas/gerar-paginas-ramo.js`); process.exit(1); }
    console.log("Páginas por ramo em dia");
} else console.log(`Páginas geradas: ${Object.values(PASTAS).join(", ")}`);
module.exports = { PASTAS };
